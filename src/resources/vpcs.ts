import { z } from 'zod'
import { EC2, paginateDescribeVpcs } from '@aws-sdk/client-ec2'
import { ensureDir, remove, writeFile } from 'fs-extra'

import Regions from './regions'

export class Vpcs {

  stringSchema = z.string().min(1).max(500)

  vpcCidrBlockStateSchema = z.object({
    State: z.union([
      z.literal('associated'),
      z.literal('associating'),
      z.literal('disassociated'),
      z.literal('disassociating'),
      z.literal('failed'),
      z.literal('failing')
    ]),
    StatusMessage: this.stringSchema.optional()
  })

  itemSchema = z.object({
    VpcId: this.stringSchema,
    CidrBlock: this.stringSchema,
    DhcpOptionsId: this.stringSchema,
    OwnerId: this.stringSchema,
    IsDefault: z.boolean(),
    State: z.union([
      z.literal('available'),
      z.literal('pending')
    ]),
    InstanceTenancy: z.union([
      z.literal('dedicated'),
      z.literal('default'),
      z.literal('host')
    ]),
    CidrBlockAssociationSet: z.array(z.object({
      AssociationId: this.stringSchema,
      CidrBlock: this.stringSchema,
      CidrBlockState: this.vpcCidrBlockStateSchema
    })),
    Ipv6CidrBlockAssociationSet: z.array(z.object({
      AssociationId: this.stringSchema,
      Ipv6CidrBlock: this.stringSchema,
      Ipv6CidrBlockState: this.vpcCidrBlockStateSchema,
      NetworkBorderGroup: this.stringSchema,
      Ipv6Pool: this.stringSchema
    })).optional(),
    Tags: z.array(z.object({
      Key: z.string().min(1).max(500),
      Value: z.string().min(1).max(500)
    })).optional()
  })

  collectionSchema = z.array(this.itemSchema).min(1).max(10000)

  async describeVpcs (params: { region: string }) {
    const ec2 = new EC2({ region: params.region })
    return paginateDescribeVpcs({ client: ec2 }, {})
  }

  async list () {
    const regions = await Regions.list()
    return Promise.all(regions.map(async region => {
      return {
        region,
        vpcs: await this.describeVpcs({ region: region.RegionName })
      }
    }))
  }

  async clear () {
    await remove('.cfs/vpcs/')
  }

  async write () {
    await this.clear()
    const vpcs = await this.list()
    await ensureDir('.cfs/vpcs/')
    await Promise.all(vpcs.map(async entry => {
      for await (const result of entry.vpcs) {
        const vpcs = await this.collectionSchema.parseAsync(result.Vpcs)
        if (vpcs.length > 0) {
          await ensureDir(`.cfs/vpcs/${encodeURIComponent(entry.region.RegionName)}/`)
        }
        for (const vpc of vpcs) {
          await writeFile(`.cfs/vpcs/${encodeURIComponent(entry.region.RegionName)}/${encodeURIComponent(vpc.VpcId)}`, JSON.stringify(vpc, null, 2))
        }
      }
    }))
  }

}

export default new Vpcs()

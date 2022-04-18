# cfs

<img src="logo.svg" width="350px">

An easy way to discover and manage your cloud like a local filesystem.

## cli

```sh
cfs
cfs ls
```

## discovering resources

```sh
cfs
```

Running the command above outputs all [discovered resources](#supported-resources) to `.cfs/` in the current directory.

```sh
cfs ls
```

Running the command above lists the names of all resource files to the console. This is useful for passing the output to other tools, like `grep`.

For example, for viewing "vpc" resource only (searching file names):

```sh
cfs ls | grep vpc
```

Or, for viewing any resource with "us-east-1" in its configuration file (searching file contents):

```sh
cfs ls | xargs grep -l us-east-1
```

Of course, you could also use the built-in search in your favorite IDE (like VSCode) or open and browse the files directly!

## updating resources

(coming soon)

## supported resources

The following cloud resources are [currently supported](./src/resources/):

- AWS API Gateway HTTP APIs
- AWS API Gateway REST APIs
- AWS S3 Buckets
- AWS ACM Certificates
- AWS CloudFront Distributions
- AWS Route53 Hosted Zones
- AWS Lambda Functions
- AWS SQS Queues
- AWS Regions
- AWS DynamoDB Tables
- AWS SNS Topics
- AWS VPCs

> Make sure you're logged in to AWS, and have the corresponding credentials file or environment variables set. Otherwise, `cfs` won't be able to query your cloud resources. Here's a quick guide from AWS on [configuring your credentials with the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html#cli-configure-quickstart-config).

## plugins

(coming soon)

## developers

This section is for developers working on the `cfs` code. If you are instead looking for usage instructions, see the sections above.

After cloning, run `npm link` to make the `cfs` CLI available. You can now edit the TypeScript source files, and whenever you run `cfs` you'll be working with the latest sources directly, without having to build/compile the TypeScript files.

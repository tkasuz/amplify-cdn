# Amplify CDN Plugin

An open source plugin for the Amplify CLI that makes it easy to integrate CloudFront distribution with Amplify Storage Category (Amazon S3)

## Installation

Amplify CDN is a [Category Plugin for AWS Amplify](https://docs.amplify.aws/cli/plugins/plugins/) that provides CloudFront distribution to your Amplify project. It requires that you have the Amplify CLI installed on your system before installing the Amplify CDN plugin

To get started install the Amplify CLI via NPM as shown below or follow the [getting started guide](https://github.com/aws-amplify/amplify-cli/).

```bash
npm install -g @aws-amplify/cli
amplify configure
```

With the Amplify CLI installed, install this plugin:
```bash
npm i amplify-category-cdn -g
```

Add a cdn resource to your Amplify project
```bash
amplify cdn add
```

## Usage

To use the plugin you just need to configure a project using `amplify init`.
Note: if you aren't developing a mobile or web app then it doesn't matter what language you choose.

### amplify cdn add

### amplify cdn update

### amplify cdn remove

### amplify cdn invalidation 
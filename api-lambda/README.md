# Kommai - Your AI assistant for social media success

## Technologies

- [AWS Lambda](https://aws.amazon.com/lambda)
- [AWS DynamoDB](https://aws.amazon.com/dynamodb)
- [Serverless](https://serverless.com/framework/docs/providers/aws/)
- [NestJS](https://docs.nestjs.com/)
- [NestJS GraphQL](https://docs.nestjs.com/graphql/quick-start)
- [NestJS Dynamoose](https://github.com/hardyscc/nestjs-dynamoose)

### System Information

- Version Control: GitHub
- YARN Version: 1.22.17
- NodeJS Version: v20.14.0
- Nest.js: v.10.4.5

## Get Started

#### Install packages and dependencies

```
cd api-lambda
yarn install
```

#### Start project

```
# start local nestjs server
$ yarn start

# start local nestjs server in watch mode
yarn start:watch
```

#### Run DynamoDB locally

Step 1: Install Java Runtime Environment (JRE) version 17.x or newer. If you are on MacOS then please use `brew` to install Java.

```
brew update
brew install --cask corretto@17
```

Step 2: After you download the archive, extract the contents and copy the extracted directory to a location of your choice.

Step 3: To start DynamoDB on your computer, open a command prompt window, navigate to the directory where you extracted `DynamoDBLocal.jar`, and enter the following command.

```
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

Optional Step (for Windows): If you're using **Windows PowerShell**, be sure to enclose the parameter name or the entire name and value like this:
`java -D"java.library.path=./DynamoDBLocal_lib" -jar DynamoDBLocal.jar`
DynamoDB processes incoming requests until you stop it. To stop DynamoDB, press Ctrl+C at the command prompt. DynamoDB uses port 8000 by default. If port 8000 is unavailable, this command throws an exception. For a complete list of DynamoDB runtime options, including `-port`, enter this command.

`java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -help`

#### Install AWS CLI

- Windows: `choco install awscli`
- MacOS: `brew install awscli`

Config AWS CLI

```bash
$ aws configure

AWS Access Key ID [****************TKYQ]:
AWS Secret Access Key [****************yNO2]:
Default region name [us-east-1]:
Default output format [None]:
```

> Please enter your **AWS Access Key ID**, **AWS Secret Access Key** and **Default region name**

## Deployment

Run the following shell script:

```
./deploy.sh
```

## Unit Testing

```bash
# run unit test
$ yarn test

# run unit test with coverage
$ yarn run test:cov
```

## Troubleshooting

#### DynamoDB Local deerh table list-g herhen harah be?

Ehleed DynamoDB local oo ajiluulna.

```
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

Daraa ni doorh command-g ajiluulna:

```
aws dynamodb list-tables --endpoint-url http://localhost:8000
```

### DynamoDB Local deerh table-g herhen ustgah be?

Ehleed DynamoDB local oo ajiluulna.

```
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

Daraa ni doorh command-g ajiluulahdaa `--table-name` araas table-iin ner-g bichne. Jishee ni table name: `quiz-stack-dev-main-comment-table`

```
aws dynamodb delete-table --table-name quiz-stack-dev-main-comment-table --endpoint-url http://localhost:8000
```

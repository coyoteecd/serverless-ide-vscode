import { collectReferenceables } from "./../index"
import { parse } from "./../../../parser/index"
import { SAM, SERVERLESS_FRAMEWORK } from "./../../../model/document"

const SAM_DOCUMENT = `
AWSTemplateFormatVersion: 2010-09-09
Transform: AWS::Serverless-2016-10-31
Globals:
    Function:
        Runtime: nodejs8.10
Resources:
    Function:
        Type: AWS::Serverless::Function
        Properties:
            CodeUri: blah
            Handler: index.js
`

const EMPTY_SAM_DOCUMENT = `
AWSTemplateFormatVersion: 2010-09-09
Transform: AWS::Serverless-2016-10-31
`

const SERVERLESS_DOCUMENT = `
# serverless.yml

service:
  name: myService

frameworkVersion: '>=1.0.0 <2.0.0'

provider:
  name: aws
  runtime: nodejs10.x
  stage: \${opt:stage, 'dev'}
  region: \${opt:region, 'us-east-1'}

functions:
  myFunction:
    name: provider.stage-lambdaName
    description: my description
    handler: handler.default
    events:
      - http:
          path: users/create
          method: get
          cors: true
          private: true
resources:
  Resources:
    Table:
      Type: AWS::DynamoDB::Table
      Properties:
        KeySchema:
          - AttributeName: ID
            KeyType: S
        AttributeDefinitions:
          - AttributeName: ID
            AttributeType: HASH
`

const EMPTY_SERVERLESS_DOCUMENT = `
# serverless.yml

service:
  name: myService

frameworkVersion: '>=1.0.0 <2.0.0'
`

describe("referenceables", () => {
	const generateDocument = (text: string) => {
		return parse(text)
	}

	describe(SAM, () => {
		test("should collect referenceables", () => {
			const doc = generateDocument(SAM_DOCUMENT)
			const referenceables = collectReferenceables(
				SAM,
				doc.documents[0].root
			)

			expect(referenceables).toEqual(["Function"])
		})

		test("should return empty array for empty document", () => {
			const doc = generateDocument(EMPTY_SAM_DOCUMENT)
			const referenceables = collectReferenceables(
				SAM,
				doc.documents[0].root
			)

			expect(referenceables).toEqual([])
		})
	})

	describe(SERVERLESS_FRAMEWORK, () => {
		test("should collect referenceables", () => {
			const doc = generateDocument(SERVERLESS_DOCUMENT)
			const referenceables = collectReferenceables(
				SERVERLESS_FRAMEWORK,
				doc.documents[0].root
			)

			expect(referenceables).toEqual(["Table"])
		})

		test("should return empty array for empty document", () => {
			const doc = generateDocument(EMPTY_SERVERLESS_DOCUMENT)
			const referenceables = collectReferenceables(
				SERVERLESS_FRAMEWORK,
				doc.documents[0].root
			)

			expect(referenceables).toEqual([])
		})
	})
})
import type { Operation, Tag } from '../src/types'

export const tags = [
  {
    name: 'pet',
    description: 'Everything about your Pets',
  },
  // truncated description
  {
    name: 'dog-go',
    description: 'This is an example of a very very ridiculously long description',
  },
  // no description
  {
    name: 'other',
  },
] as Tag[]

export const specOp = {
  path: '/pet',
  method: 'delete',
  operationId: 'deletePet',
  tags: ['dog-go', 'other'],
  summary: 'Deletes a pet',
  deprecated: false,
}
export const operationsList = [
  {
    path: '/pet',
    method: 'get',
    operationId: 'getPets',
    tags: ['pet'],
    summary: 'Get all pets',
    deprecated: false,
  },
  // non-unique path
  {
    path: '/pet',
    method: 'post',
    operationId: 'addPet',
    tags: ['pet'],
    summary: 'Add a new pet to the store',
    deprecated: false,
  },
  // different tag
  {
    path: '/pet/{petId}',
    method: 'get',
    operationId: 'getPetById',
    tags: ['dog-go'],
    summary: 'Find pet by ID',
    deprecated: false,
  },
  // untagged
  {
    path: '/pet/{petId}',
    method: 'post',
    operationId: 'updatePet',
    tags: undefined,
    summary: 'Update an existing pet',
    deprecated: false,
  },
  // multiple tags
  specOp,
] as Operation[]

export const yamlSpec = `
swagger: '2.0'
info:
  description: 'This is a sample server Petstore server.  You can find out more about Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).  For this sample, you can use the api key "special-key" to test the authorization filters.'
  version: 1.0.0
  title: Swagger Petstore v3
  termsOfService: 'http://swagger.io/terms/'
  contact:
    email: apiteam@swagger.io
  license:
    name: Apache 2.0
    url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
host: petstore.swagger.io
basePath: /v3
tags:
  - name: pet
    description: Everything about your Pets
    externalDocs:
      description: Find out more
      url: 'http://swagger.io'
  - name: store
    description: Access to Petstore orders
  - name: user
    description: Operations about user
    externalDocs:
      description: Find out more about our store
      url: 'http://swagger.io'
schemes:
  - https
  - http
paths:
  /pet:
    post:
      tags:
        - pet
      summary: Add a new pet to the store
      description: ''
      operationId: addPet
      consumes:
        - application/json
        - application/xml
      produces:
        - application/xml
        - application/json
      parameters:
        - in: body
          name: body
          description: Pet object that needs to be added to the store
          required: true
          schema:
            $ref: '#/definitions/Pet'
      responses:
        '405':
          description: Invalid input
      security:
        - petstore_auth:
            - 'write:pets'
            - 'read:pets'
    put:
      tags:
        - pet
      summary: Update an existing pet
      description: ''
      operationId: updatePet
      consumes:
        - application/json
        - application/xml
      produces:
        - application/xml
        - application/json
      parameters:
        - in: body
          name: body
          description: Pet object that needs to be added to the store
          required: true
          schema:
            $ref: '#/definitions/Pet'
      responses:
        '400':
          description: Invalid ID supplied
        '404':
          description: Pet not found
        '405':
          description: Validation exception
      security:
        - petstore_auth:
            - 'write:pets'
            - 'read:pets'
  '/pet/{petId}':
    get:
      tags:
        - 'dog-go'
      summary: Find pet by ID
      description: Returns a single pet
      operationId: getPetById
      produces:
        - application/xml
        - application/json
      parameters:
        - name: petId
          in: path
          description: ID of pet to return
          required: true
          type: integer
          format: int64
      responses:
        '200':
          description: successful operation
          schema:
            $ref: '#/definitions/Pet'
        '400':
          description: Invalid ID supplied
        '404':
          description: Pet not found
      security:
        - api_key: []
    post:
      summary: Updates a pet in the store with form data
      description: ''
      operationId: updatePetWithForm
      consumes:
        - application/x-www-form-urlencoded
      produces:
        - application/xml
        - application/json
      parameters:
        - name: petId
          in: path
          description: ID of pet that needs to be updated
          required: true
          type: integer
          format: int64
        - name: name
          in: formData
          description: Updated name of the pet
          required: false
          type: string
        - name: status
          in: formData
          description: Updated status of the pet
          required: false
          type: string
      responses:
        '405':
          description: Invalid input
      security:
        - petstore_auth:
            - 'write:pets'
            - 'read:pets'
    delete:
      tags:
        - 'dog-go'
        - other
      summary: Deletes a pet
      description: ''
      operationId: deletePet
      produces:
        - application/xml
        - application/json
      parameters:
        - name: api_key
          in: header
          required: false
          type: string
        - name: petId
          in: path
          description: Pet id to delete
          required: true
          type: integer
          format: int64
      responses:
        '400':
          description: Invalid ID supplied
        '404':
          description: Pet not found
      security:
        - petstore_auth:
            - 'write:pets'
            - 'read:pets'
securityDefinitions:
  petstore_auth:
    type: oauth2
    authorizationUrl: 'https://petstore.swagger.io/oauth/authorize'
    flow: implicit
    scopes:
      'write:pets': modify pets in your account
      'read:pets': read your pets
  api_key:
    type: apiKey
    name: api_key
    in: header
definitions:
  Category:
    type: object
    properties:
      id:
        type: integer
        format: int64
      name:
        type: string
    xml:
      name: Category
  Tag:
    type: object
    properties:
      id:
        type: integer
        format: int64
      name:
        type: string
    xml:
      name: Tag
  Pet:
    type: object
    required:
      - name
      - photoUrls
    properties:
      id:
        type: integer
        format: int64
      category:
        $ref: '#/definitions/Category'
      name:
        type: string
        example: doggie
      photoUrls:
        type: array
        xml:
          name: photoUrl
          wrapped: true
        items:
          type: string
      tags:
        type: array
        xml:
          name: tag
          wrapped: true
        items:
          $ref: '#/definitions/Tag'
      status:
        type: string
        description: pet status in the store
        enum:
          - available
          - pending
          - sold
    xml:
      name: Pet
  ApiResponse:
    type: object
    properties:
      code:
        type: integer
        format: int32
      type:
        type: string
      message:
        type: string
externalDocs:
  description: Find out more about Swagger
  url: 'http://swagger.io'
`

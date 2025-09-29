import { authService } from '../services/keycloak';

// GraphQL Introspection Types
interface GraphQLType {
  name: string;
  kind: string;
  fields?: GraphQLField[];
  inputFields?: GraphQLInputField[];
}

interface GraphQLField {
  name: string;
  type: GraphQLTypeRef;
}

interface GraphQLInputField {
  name: string;
  type: GraphQLTypeRef;
}

interface GraphQLTypeRef {
  name?: string;
  kind: string;
  ofType?: GraphQLTypeRef;
}

interface GraphQLSchema {
  queryType: { name: string };
  mutationType?: { name: string };
  types: GraphQLType[];
}

interface IntrospectionResponse {
  data: {
    __schema: GraphQLSchema;
  };
}

export class GraphQLInspector {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8090';
  }

  /**
   * Get the complete GraphQL schema
   */
  async introspectSchema(): Promise<IntrospectionResponse> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType { name }
          mutationType { name }
          types {
            name
            kind
            fields {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
            inputFields {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch(`${this.baseUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: introspectionQuery
      })
    });

    const result = await response.json();
    return result as IntrospectionResponse;
  }

  /**
   * Check what queries are available
   */
  async getAvailableQueries(): Promise<GraphQLField[]> {
    const schema = await this.introspectSchema();
    const queryType = schema.data.__schema.types.find((type: GraphQLType) =>
      type.name === schema.data.__schema.queryType.name
    );

    console.log('📋 Available Queries:');
    queryType?.fields?.forEach((field: GraphQLField) => {
      console.log(`  - ${field.name}: ${field.type.name || field.type.ofType?.name}`);
    });

    return queryType?.fields || [];
  }

  /**
   * Check what mutations are available
   */
  async getAvailableMutations(): Promise<GraphQLField[]> {
    const schema = await this.introspectSchema();
    const mutationType = schema.data.__schema.types.find((type: GraphQLType) =>
      type.name === schema.data.__schema.mutationType?.name
    );

    console.log('🔧 Available Mutations:');
    mutationType?.fields?.forEach((field: GraphQLField) => {
      console.log(`  - ${field.name}: ${field.type.name || field.type.ofType?.name}`);
    });

    return mutationType?.fields || [];
  }

  /**
   * Get details about a specific type
   */
  async getTypeDetails(typeName: string): Promise<GraphQLType | undefined> {
    const schema = await this.introspectSchema();
    const type = schema.data.__schema.types.find((t: GraphQLType) => t.name === typeName);

    console.log(`📝 Type Details for '${typeName}':`, type);
    return type;
  }

  /**
   * Get details about input types specifically
   */
  async getInputTypeDetails(typeName: string): Promise<GraphQLType | undefined> {
    const schema = await this.introspectSchema();
    const type = schema.data.__schema.types.find((t: GraphQLType) => 
      t.name === typeName && t.kind === 'INPUT_OBJECT'
    );

    console.log(`📝 Input Type Details for '${typeName}':`, type);
    if (type && type.inputFields) {
      console.log(`📋 ${typeName} fields:`);
      type.inputFields.forEach((field: GraphQLInputField) => {
        const fieldType = field.type.name || field.type.ofType?.name || 'Unknown';
        console.log(`   - ${field.name}: ${fieldType}`);
      });
    }
    return type;
  }

  /**
   * Get all input types for company operations
   */
  async getCompanyInputTypes(): Promise<void> {
    console.log('\n🏢 Company Input Types:');
    console.log('='.repeat(40));
    
    await this.getInputTypeDetails('CreateCompanyInput');
    await this.getInputTypeDetails('UpdateCompanyInput');
  }

  /**
   * Test a simple query to see what we get
   */
  async testQuery(query: string, variables?: Record<string, unknown>): Promise<unknown> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }

    console.log('🔍 Testing Query:', query);
    if (variables) console.log('📊 Variables:', variables);

    const response = await fetch(`${this.baseUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const result = await response.json();
    console.log('✅ Response:', result);
    return result;
  }
}

export const graphqlInspector = new GraphQLInspector();

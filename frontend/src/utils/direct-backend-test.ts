import { authService } from '../services/keycloak';

// GraphQL Schema introspection types
interface GraphQLType {
  name: string;
  kind: string;
  ofType?: GraphQLType | null;
}

interface GraphQLField {
  name: string;
  type: GraphQLType;
}

interface GraphQLTypeDefinition {
  name: string;
  kind: string;
  fields?: GraphQLField[] | null;
}

interface GraphQLSchema {
  queryType: { name: string };
  types: GraphQLTypeDefinition[];
}

interface GraphQLIntrospectionResult {
  data: {
    __schema: GraphQLSchema;
  };
  errors?: Array<{ message: string }>;
}

interface GraphQLTestResult {
  data?: Record<string, unknown>;
  errors?: Array<{ message: string }>;
}

export interface CountriesQueryResult {
  queryName: string;
  countries: unknown[];
  workingFields: string[];
  schema: GraphQLTestResult;
}

export async function findCountriesQuery(): Promise<CountriesQueryResult> {
  const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8090';
  const token = authService.getToken();

  if (!token) {
    throw new Error('No auth token available');
  }

  console.log('🔍 Starting direct backend introspection...');

  // First get the schema
  const introspectionQuery = `
    query IntrospectionQuery {
      __schema {
        queryType { name }
        types {
          name
          kind
          fields {
            name
            type {
              name
              kind
              ofType { name kind }
            }
          }
        }
      }
    }
  `;

  console.log('📡 Fetching GraphQL schema...');

  try {
    const response = await fetch(`${baseUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: introspectionQuery })
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`);
    }

    const result: GraphQLIntrospectionResult = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${result.errors.map((e) => e.message).join(', ')}`);
    }

    console.log('✅ Schema retrieved successfully');

    // Find the Query type
    const queryType = result.data.__schema.types.find((type: GraphQLTypeDefinition) =>
      type.name === result.data.__schema.queryType.name
    );

    if (!queryType) {
      throw new Error('Could not find Query type in schema');
    }

    console.log(`🔍 Found ${queryType.fields?.length || 0} available queries:`);
    queryType?.fields?.forEach((field: GraphQLField) => {
      const returnType = field.type.name || field.type.ofType?.name || 'Unknown';
      console.log(`  📊 ${field.name} → ${returnType}`);
    });

    // Find country-related queries with broader search
    const countryFields = queryType?.fields?.filter((field: GraphQLField) => {
      const fieldName = field.name.toLowerCase();
      return fieldName.includes('country') ||
             fieldName.includes('countries') ||
             fieldName.includes('nation') ||
             fieldName.includes('locale') ||
             fieldName.includes('region');
    }) || [];

    console.log(`\n🌍 Found ${countryFields.length} potential country-related queries:`);
    countryFields.forEach((field: GraphQLField) => {
      const returnType = field.type.name || field.type.ofType?.name || 'Unknown';
      console.log(`  🗺️  ${field.name} → ${returnType}`);
    });

    if (countryFields.length === 0) {
      console.warn('❌ No country-related queries found in schema');
      console.log('Available queries that might contain geography data:');
      queryType?.fields?.forEach((field: GraphQLField) => {
        if (field.name.toLowerCase().includes('geo') ||
            field.name.toLowerCase().includes('location') ||
            field.name.toLowerCase().includes('address')) {
          console.log(`  🌐 ${field.name}`);
        }
      });
      throw new Error('No country-related queries available in backend GraphQL schema');
    }

    // Test each country query with comprehensive field sets
    for (const field of countryFields) {
      console.log(`\n🧪 Testing query: ${field.name}`);

      // Try different field combinations to handle various schemas
      const fieldCombinations = [
        ['id', 'name', 'code'],
        ['id', 'name'],
        ['countryId', 'countryName', 'countryCode'],
        ['countryId', 'countryName'],
        ['id', 'countryName', 'code'],
        ['code', 'name'],
        ['*'] // This will be converted to a simple query
      ];

      for (const fields of fieldCombinations) {
        const fieldSelection = fields[0] === '*' ? field.name : fields.join('\n          ');
        const testQuery = fields[0] === '*'
          ? `query Test { ${field.name} }`
          : `query Test {
              ${field.name} {
                ${fieldSelection}
              }
            }`;

        try {
          console.log(`  🔬 Testing with fields: [${fields.join(', ')}]`);

          const testResponse = await fetch(`${baseUrl}/graphql`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: testQuery })
          });

          const testResult: GraphQLTestResult = await testResponse.json();

          if (testResult.errors) {
            console.log(`    ⚠️  GraphQL errors: ${testResult.errors.map((e) => e.message).join(', ')}`);
            continue; // Try next field combination
          }

          if (testResult.data && testResult.data[field.name]) {
            const data = testResult.data[field.name];
            console.log(`    ✅ SUCCESS! Query "${field.name}" returned data:`, data);

            // Check if it's an array with country-like data
            if (Array.isArray(data)) {
              console.log(`    📊 Found ${data.length} records`);
              if (data.length > 0) {
                console.log(`    📝 Sample record:`, data[0]);
              }
            } else {
              console.log(`    📝 Single record:`, data);
            }

            return {
              queryName: field.name,
              countries: Array.isArray(data) ? data : [data],
              workingFields: fields[0] === '*' ? [] : fields,
              schema: testResult
            };
          }
        } catch (error) {
          console.log(`    ❌ Request failed:`, error);
        }
      }
    }

    throw new Error(`No working countries query found. Tested ${countryFields.length} potential queries but none returned data.`);

  } catch (error) {
    console.error('❌ Backend introspection failed:', error);
    throw error;
  }
}

// Export for browser usage
if (typeof window !== 'undefined') {
  (window as typeof window & {
    findCountriesQuery: typeof findCountriesQuery;
  }).findCountriesQuery = findCountriesQuery;
}

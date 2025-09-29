const fetch = require('node-fetch');

// You'll need to replace this with a valid token from your browser
const TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJWMnBkM1dwc1NzNk1RMjh0WHI5U1JjV2VDV0VvY084ak03Z1NGc1FmOXlZIn0.eyJleHAiOjE3NTg5MTgyNDksImlhdCI6MTc1ODkxNzk0OSwianRpIjoib25ydHJvOmE4YzdmOTE2LWE3MjMtZjIyYS03MGIyLTg1YmU2MGYyNTE4YiIsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA5MC9yZWFsbXMvc3lzdGVjaCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJjMTZmM2RmMi0yNmM2LTQ5ZjEtOWQ1Zi01ZTZjN2VkY2FhYjIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJzeXN0ZWNoLWhybXMtY2xpZW50Iiwic2lkIjoiNDllYzQ3NzQtYzQ5ZS00ZWRiLWE3YzQtNDk0MDMxODdlNDc5IiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMwMDEiLCJodHRwOi8vbG9jYWxob3N0OjMwMDAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwiZGVmYXVsdC1yb2xlcy1zeXN0ZWNoIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkJhYnUgU3lzdGVjaCIsInByZWZlcnJlZF91c2VybmFtZSI6ImJhYnUuc3lzdGVjaCIsImdpdmVuX25hbWUiOiJCYWJ1IiwiZmFtaWx5X25hbWUiOiJTeXN0ZWNoIiwiZW1haWwiOiJiYWJ1QHN5c3RlY2guY29tIn0.14si6fw5C-WuhYb-fdLxdkSP5vsLjEw2oy9C0R_nOGf2rk1CWKcL9PDjQKalv4VPfsTJU_9sDi4_ZrjfX1FKRACEk4pKJWkBXleNtWB93I3kEXqsA5k2eQuJVfqucoaTvb1kNbRy-m1AtscBr5nqRjR2_5KH-cwbqOfsvse4SmOOU-xz4SVmqIV67FqtwFD7o0maEhGQ5RSZ3oXgrPtOzqrYH_bbztIEH9jt8I3ckExWhtFKBmFWuBwiqvud6SZ5Kb0Camf2yYgtWqgIVZsCtGKUpjad0FVR636oYU41Ci3mVEzFu5oJEqB20IVT2fj8HsNyZpuyfm8s49fpEfW-jg";

async function findCountriesQuery() {
  const baseUrl = 'http://localhost:8080';

  if (!TOKEN) {
    throw new Error('No auth token');
  }

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

  console.log('🔍 Getting backend schema...');

  const response = await fetch(`${baseUrl}/graphql`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: introspectionQuery })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  console.log('📋 Schema result:', JSON.stringify(result, null, 2));

  // Find the Query type
  const queryType = result.data.__schema.types.find((type) =>
    type.name === result.data.__schema.queryType.name
  );

  console.log('🔍 Available queries:');
  queryType?.fields?.forEach((field) => {
    console.log(`  - ${field.name}: ${field.type.name || field.type.ofType?.name}`);
  });

  // Find country-related queries
  const countryFields = queryType?.fields?.filter((field) =>
    field.name.toLowerCase().includes('country') ||
    field.name.toLowerCase().includes('countries')
  ) || [];

  console.log('🌍 Country-related queries found:', countryFields);

  // Test each country query
  for (const field of countryFields) {
    console.log(`\n🧪 Testing query: ${field.name}`);

    const testQuery = `
      query Test {
        ${field.name} {
          id
          name
          code
        }
      }
    `;

    try {
      const testResponse = await fetch(`${baseUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: testQuery })
      });

      const testResult = await testResponse.json();
      console.log(`✅ ${field.name} result:`, testResult);

      if (testResult.data && testResult.data[field.name]) {
        console.log(`🎯 FOUND WORKING COUNTRIES QUERY: ${field.name}`);
        console.log(`📊 Countries data:`, testResult.data[field.name]);
        return {
          queryName: field.name,
          countries: testResult.data[field.name]
        };
      }
    } catch (error) {
      console.log(`❌ ${field.name} failed:`, error);
    }
  }

  throw new Error('No working countries query found');
}

findCountriesQuery()
  .then(result => {
    console.log('\n🎯 FINAL RESULT:', JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('\n❌ FINAL ERROR:', error.message);
  });
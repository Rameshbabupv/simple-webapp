import { graphqlInspector } from './graphql-inspector';

export async function introspectCompanyDomain() {
  console.log('🏢 Company Domain Introspection');
  console.log('='.repeat(50));

  try {
    // Get the full schema
    const schema = await graphqlInspector.introspectSchema();

    // Get all types
    const allTypes = schema.data.__schema.types;

    // Find Company-related types
    console.log('\n📋 Company-Related Types:');
    console.log('-'.repeat(30));

    const companyTypes = allTypes.filter(type =>
      type.name.toLowerCase().includes('company') ||
      type.name.toLowerCase().includes('country')
    );

    companyTypes.forEach(type => {
      console.log(`\n🏷️  ${type.name} (${type.kind})`);
      if (type.fields && type.fields.length > 0) {
        type.fields.forEach(field => {
          const fieldType = field.type.name || field.type.ofType?.name || 'Unknown';
          console.log(`   - ${field.name}: ${fieldType}`);
        });
      }
    });

    // Get available queries
    console.log('\n\n🔍 Available Queries:');
    console.log('-'.repeat(30));
    const queries = await graphqlInspector.getAvailableQueries();

    const companyQueries = queries.filter(query =>
      query.name.toLowerCase().includes('company') ||
      query.name.toLowerCase().includes('countries')
    );

    companyQueries.forEach(query => {
      const returnType = query.type.name || query.type.ofType?.name || 'Unknown';
      console.log(`📊 ${query.name}: ${returnType}`);
    });

    // Get available mutations
    console.log('\n\n🔧 Available Mutations:');
    console.log('-'.repeat(30));
    const mutations = await graphqlInspector.getAvailableMutations();

    const companyMutations = mutations.filter(mutation =>
      mutation.name.toLowerCase().includes('company')
    );

    companyMutations.forEach(mutation => {
      const returnType = mutation.type.name || mutation.type.ofType?.name || 'Unknown';
      console.log(`⚡ ${mutation.name}: ${returnType}`);
    });

    // Test the companies query
    console.log('\n\n🧪 Testing Companies Query:');
    console.log('-'.repeat(30));

    const testQuery = `
      query GetAllCompanies {
        companies {
          id
          companyCode
          companyName
          primaryEmail
          country
          companyStatus
          createdAt
          modifiedAt
        }
      }
    `;

    const queryResult = await graphqlInspector.testQuery(testQuery);
    console.log('📈 Query Result Sample:', queryResult);

    // Get detailed Company type information
    console.log('\n\n📝 Company Type Details:');
    console.log('-'.repeat(30));
    const companyType = await graphqlInspector.getTypeDetails('Company');

    return {
      types: companyTypes,
      queries: companyQueries,
      mutations: companyMutations,
      companyType,
      testResult: queryResult
    };

  } catch (error) {
    console.error('❌ Error during introspection:', error);
    throw error;
  }
}

// Export function for direct input type inspection
export async function introspectCompanyInputTypes() {
  console.log('🔍 Company Input Types Introspection');
  console.log('='.repeat(50));

  try {
    await graphqlInspector.getCompanyInputTypes();
    return true;
  } catch (error) {
    console.error('❌ Error during input types introspection:', error);
    throw error;
  }
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as typeof window & {
    introspectCompanyDomain: typeof introspectCompanyDomain;
    introspectCompanyInputTypes: typeof introspectCompanyInputTypes;
  }).introspectCompanyDomain = introspectCompanyDomain;
  (window as typeof window & {
    introspectCompanyDomain: typeof introspectCompanyDomain;
    introspectCompanyInputTypes: typeof introspectCompanyInputTypes;
  }).introspectCompanyInputTypes = introspectCompanyInputTypes;
}
import { graphqlInspector } from './graphql-inspector';

export async function testCountriesIntrospection() {
  console.log('🌍 Testing Countries Backend Introspection');
  console.log('='.repeat(50));

  try {
    // Get available queries
    const queries = await graphqlInspector.getAvailableQueries();

    // Find country-related queries
    const countryQueries = queries.filter(query =>
      query.name.toLowerCase().includes('country') ||
      query.name.toLowerCase().includes('countries')
    );

    console.log('\n🔍 Country-related queries found:');
    if (countryQueries.length === 0) {
      console.log('❌ No country-related queries found in backend');
    } else {
      countryQueries.forEach(query => {
        const returnType = query.type.name || query.type.ofType?.name || 'Unknown';
        console.log(`✅ ${query.name}: ${returnType}`);
      });
    }

    // Test each country query to see what data we get
    for (const query of countryQueries) {
      console.log(`\n🧪 Testing query: ${query.name}`);

      try {
        const testQuery = `
          query Test${query.name} {
            ${query.name} {
              id
              name
              code
            }
          }
        `;

        const result = await graphqlInspector.testQuery(testQuery);
        console.log(`✅ ${query.name} result:`, result);
      } catch (error) {
        console.log(`❌ ${query.name} failed:`, error);
      }
    }

    return countryQueries;

  } catch (error) {
    console.error('❌ Introspection failed:', error);
    throw error;
  }
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as typeof window & { testCountriesIntrospection: typeof testCountriesIntrospection }).testCountriesIntrospection = testCountriesIntrospection;
}
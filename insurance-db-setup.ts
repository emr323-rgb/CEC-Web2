import { db } from './server/db';

async function main() {
  try {
    console.log('Creating insurance_providers table...');
    
    // Create the table using a raw SQL query
    await db.execute(`
      CREATE TABLE IF NOT EXISTS insurance_providers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        logo_url TEXT,
        website_url TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE
      );
    `);
    
    console.log('Table created successfully!');
    
    // Add insurance providers
    console.log('Adding insurance providers...');
    
    // Define insurance providers
    const insuranceProviders = [
      {
        name: 'Aetna',
        description: 'Aetna health insurance plans and products',
        logoUrl: 'https://www.seekpng.com/png/full/335-3357354_aetna-logo-aetna-health-insurance-logo.png',
        websiteUrl: 'https://www.aetna.com/',
        sortOrder: 1
      },
      {
        name: 'Blue Cross Blue Shield',
        description: 'Blue Cross Blue Shield Association is a federation of 35 separate health insurance organizations',
        logoUrl: 'https://www.seekpng.com/png/full/428-4286723_blue-cross-blue-shield-logo-transparent-blue-cross.png',
        websiteUrl: 'https://www.bcbs.com/',
        sortOrder: 2
      },
      {
        name: 'Cigna',
        description: 'Global health service company offering health, pharmacy, dental, behavioral health coverage',
        logoUrl: 'https://1000logos.net/wp-content/uploads/2021/04/Cigna-logo.png',
        websiteUrl: 'https://www.cigna.com/',
        sortOrder: 3
      },
      {
        name: 'UnitedHealthcare',
        description: 'UnitedHealthcare offers a full range of insurance plans and services',
        logoUrl: 'https://logodix.com/logo/2064278.png',
        websiteUrl: 'https://www.uhc.com/',
        sortOrder: 4
      },
      {
        name: 'Humana',
        description: 'Humana offers a wide range of insurance products and health plans',
        logoUrl: 'https://logodix.com/logo/2090124.jpg',
        websiteUrl: 'https://www.humana.com/',
        sortOrder: 5
      },
      {
        name: 'Kaiser Permanente',
        description: 'Kaiser Permanente is an integrated managed care consortium',
        logoUrl: 'https://1000logos.net/wp-content/uploads/2018/03/Kaiser-Permanente-logo.png',
        websiteUrl: 'https://healthy.kaiserpermanente.org/',
        sortOrder: 6
      },
      {
        name: 'Anthem',
        description: 'Anthem is a provider of health insurance in the United States',
        logoUrl: 'https://1000logos.net/wp-content/uploads/2021/04/Anthem-logo.png',
        websiteUrl: 'https://www.anthem.com/',
        sortOrder: 7
      },
      {
        name: 'Centene',
        description: 'Centene Corporation is a healthcare enterprise that provides programs and services to government healthcare programs',
        logoUrl: 'https://www.pngkey.com/png/full/942-9427476_image-centene-corporation-logo.png',
        websiteUrl: 'https://www.centene.com/',
        sortOrder: 8
      }
    ];
    
    // Insert each provider if it doesn't already exist
    for (const provider of insuranceProviders) {
      const providerExistsQuery = `SELECT id FROM insurance_providers WHERE name = '${provider.name}' LIMIT 1;`;
      const providerExists = await db.execute(providerExistsQuery);
      
      if (!providerExists.rows.length) {
        // Insert provider
        const insertQuery = `
          INSERT INTO insurance_providers (name, description, logo_url, website_url, sort_order, is_active)
          VALUES ('${provider.name}', '${provider.description}', '${provider.logoUrl}', '${provider.websiteUrl}', ${provider.sortOrder}, TRUE);
        `;
        await db.execute(insertQuery);
        console.log(`Added insurance provider: ${provider.name}`);
      } else {
        // Update existing provider with new data
        const updateQuery = `
          UPDATE insurance_providers 
          SET description = '${provider.description}', 
              logo_url = '${provider.logoUrl}', 
              website_url = '${provider.websiteUrl}', 
              sort_order = ${provider.sortOrder}
          WHERE name = '${provider.name}';
        `;
        await db.execute(updateQuery);
        console.log(`Updated insurance provider: ${provider.name}`);
      }
    }
    
    console.log('Insurance providers setup completed successfully!');
  } catch (error) {
    console.error('Error setting up insurance providers:', error);
  } finally {
    process.exit(0);
  }
}

main();
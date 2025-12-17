const fs = require('fs');
const path = require('path');

/**
 * Import script to load Hotel data from JSON file and import to Strapi
 * This script reads the Hotel.json file, processes the data, and imports to Strapi via REST API
 */

// Strapi configuration
const STRAPI_BASE_URL = process.env.APIHOST || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN; // Set this environment variable
const BATCH_SIZE = 50; // Import in batches to avoid overwhelming the API

async function loadHotelData() {
  try {
    // Path to the Hotel.json file
    const jsonFilePath = path.join(__dirname, 'data', 'Hotel.json');
    
    console.log('Loading Hotel.json from:', jsonFilePath);
    
    // Check if file exists
    if (!fs.existsSync(jsonFilePath)) {
      console.error('Hotel.json file not found at:', jsonFilePath);
      return null;
    }
    
    // Read and parse JSON file
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    let hotels = JSON.parse(jsonData);
    
    hotels = hotels.map(hotel => {
        return {
            description: hotel.description,
            old_id: hotel.id,
            name: hotel.name,
            longName: hotel.longName,
            addressCity: hotel.addressCity,
            addressState: hotel.addressState,
            addressZip: hotel.addressZip,
            website: hotel.website,
            amenities: hotel.amenities,
    }});

    console.log('Sample hotel:', hotels[0]);
    console.log(`Successfully loaded ${hotels.length} hotels`);

    //nothing found
    if (hotels.length === 0) {
      process.exit();
    }
    
    return hotels;
    
  } catch (error) {
    console.error('Error loading Hotel data:', error);
    return null;
  }
}

/**
 * Process hotels and prepare for Strapi import
 */
async function processHotels(hotels) {
  if (!hotels) {
    console.error('No hotels to process');
    return;
  }
  
  console.log('Processing hotels...');
  
  // Group by conference
  const hotelsByConference = hotels.reduce((acc, hotel) => {
    const conferenceId = hotel.conference;
    if (!acc[conferenceId]) {
      acc[conferenceId] = [];
    }
    acc[conferenceId].push(hotel);
    return acc;
  }, {});
  
  console.log(`Found hotels for ${Object.keys(hotelsByConference).length} conferences`);
  
  // Log summary stats
  Object.entries(hotelsByConference).forEach(([conferenceId, hotels]) => {
    console.log(`Conference ${conferenceId}: ${hotels.length} hotels`);
  });
  
  return hotelsByConference;
}

/**
 * Make HTTP request to Strapi API
 */
async function makeApiRequest(endpoint, method = 'GET', data = null) {
  const url = `${STRAPI_BASE_URL}/api/${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add authorization if API token is provided
  if (STRAPI_API_TOKEN) {
    options.headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * Check if hotel already exists in Strapi
 */
async function checkHotelExists(oldId) {
  try {
    const response = await makeApiRequest(`hotels?filters[old_id][$eq]=${oldId}`);
    return response.data && response.data.length > 0;
  } catch (error) {
    console.error('Error checking if hotel exists:', error.message);
    return false;
  }
}

// Cache for conference lookups to avoid repeated API calls
let conferencesCache = null;

/**
 * Get all conferences from Strapi and cache them
 */
async function getAllConferences() {
  if (conferencesCache) {
    return conferencesCache;
  }
  
  try {
    console.log('Loading conferences from Strapi...');
    const response = await makeApiRequest('conferences');
    conferencesCache = response.data || [];
    console.log(`Loaded ${conferencesCache.length} conferences`);
    return conferencesCache;
  } catch (error) {
    console.error('Error loading conferences:', error.message);
    return [];
  }
}

/**
 * Find conference documentId by old_id
 */
async function findConferenceDocumentId(oldId) {
  const conferences = await getAllConferences();
  const conference = conferences.find(conf => conf.old_id === oldId);
  return conference ? conference.documentId : null;
}

/**
 * Create a single hotel in Strapi
 */
async function createHotel(hotel) {
  // Look up the conference documentId using hotel.conference
  const conferenceDocumentId = await findConferenceDocumentId(hotel.conference);
  
  if (!conferenceDocumentId) {
    console.warn(`Conference not found for old_id: ${hotel.conference}`);
  }
  
  const data = {
    data: hotel
  };
  
  try {
    return await makeApiRequest('hotels', 'POST', data);
  } catch (error) {
    console.error(`Failed to create hotel ${hotel.old_id}:`, error.message);
    throw error;
  }
}

/**
 * Import hotels to Strapi in batches
 */
async function importHotelsToStrapi(hotels) {
  console.log(`Starting import of ${hotels.length} hotels to Strapi...`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  // Process in batches
  for (let i = 0; i < hotels.length; i += BATCH_SIZE) {
    const batch = hotels.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(hotels.length/BATCH_SIZE)} (${batch.length} hotels)`);

    for (const hotel of batch) {
      try {
        // Check if hotel already exists
        const exists = await checkHotelExists(hotel.old_id);
        
        if (exists) {
          console.log(`Skipping existing hotel: ${hotel.old_id} - ${hotel.name}`);
          skipped++;
        } else {
          // Create new hotel
          await createHotel(hotel);
          console.log(`Imported hotel: ${hotel.old_id} - ${hotel.name}`);
          imported++;
        }
      } catch (error) {
        console.error(`Error processing hotel ${hotel.old_id}:`, error.message);
        errors++;
      }
    }

    // Small delay between batches to be gentle on the API
    if (i + BATCH_SIZE < hotels.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n--- Import Summary ---');
  console.log(`Total processed: ${hotels.length}`);
  console.log(`Successfully imported: ${imported}`);
  console.log(`Skipped (already exists): ${skipped}`);
  console.log(`Errors: ${errors}`);
  
  return { imported, skipped, errors };
}

/**
 * Test Strapi connection
 */
async function testStrapiConnection() {
  try {
    console.log('Testing Strapi connection...');
    // Try conferences endpoint first (we know this works from the frontend)
    await makeApiRequest('conferences?pagination[limit]=1');
    console.log('✅ Strapi connection successful');
    return true;
  } catch (conferenceError) {
    console.log('Conferences endpoint failed, trying hotels...');
    try {
      await makeApiRequest('hotels?pagination[limit]=1');
      console.log('✅ Strapi connection successful via hotels');
      return true;
    } catch (hotelError) {
      console.error('❌ Strapi connection failed:', hotelError.message);
      console.error('Make sure Strapi is running on', STRAPI_BASE_URL);
      if (!STRAPI_API_TOKEN) {
        console.error('Consider setting STRAPI_API_TOKEN environment variable for authenticated requests');
        console.error('Or make sure the hotels collection type is publicly accessible in Strapi permissions');
      }
      return false;
    }
  }
}

/**
 * Main function to execute the import
 */
async function main() {
  console.log('Starting Hotel JSON import to Strapi...');
  
  // Test Strapi connection first
  const connected = await testStrapiConnection();
  if (!connected) {
    console.log('Import aborted due to connection issues');
    return;
  }
  
  // Load the JSON data
  const hotels = await loadHotelData();
  
  if (!hotels) {
    console.log('Import failed - no data loaded');
    return;
  }

  // Process the data
  const processedData = await processHotels(hotels);
  
  // Import to Strapi
  const result = await importHotelsToStrapi(hotels);
  
  console.log('\n🎉 Import process completed!');
  
  if (result.errors > 0) {
    console.log('⚠️  Some hotels failed to import. Check the logs above for details.');
  }
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  loadHotelData,
  processHotels,
  makeApiRequest,
  getAllConferences,
  findConferenceDocumentId,
  createHotel,
  importHotelsToStrapi,
  testStrapiConnection,
  main
};
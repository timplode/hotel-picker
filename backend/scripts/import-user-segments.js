const fs = require('fs');
const path = require('path');

/**
 * Import script to load UserSegment data from JSON file and import to Strapi
 * This script reads the UserSegment.json file, processes the data, and imports to Strapi via REST API
 */

// Strapi configuration
const STRAPI_BASE_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN; // Set this environment variable
const BATCH_SIZE = 50; // Import in batches to avoid overwhelming the API

async function loadUserSegmentData() {
  try {
    // Path to the UserSegment.json file
    const jsonFilePath = path.join(__dirname, 'data', 'UserSegment.json');
    
    console.log('Loading UserSegment.json from:', jsonFilePath);
    
    // Check if file exists
    if (!fs.existsSync(jsonFilePath)) {
      console.error('UserSegment.json file not found at:', jsonFilePath);
      return null;
    }
    
    // Read and parse JSON file
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    let userSegments = JSON.parse(jsonData);
    
    userSegments = userSegments.map(segment => {
        return {
            conference: segment.conference,
            description: segment.description,
            old_id: segment.id,
            name: segment.name,
    }});

    console.log('Sample user segment:', userSegments[0]);
    console.log(`Successfully loaded ${userSegments.length} user segments`);

    //nothing found
    if (userSegments.length === 0) {
      process.exit();
    }
    
    return userSegments;
    
  } catch (error) {
    console.error('Error loading UserSegment data:', error);
    return null;
  }
}

/**
 * Process user segments and prepare for Strapi import
 */
async function processUserSegments(userSegments) {
  if (!userSegments) {
    console.error('No user segments to process');
    return;
  }
  
  console.log('Processing user segments...');
  
  // Group by conference
  const segmentsByConference = userSegments.reduce((acc, segment) => {
    const conferenceId = segment.conference;
    if (!acc[conferenceId]) {
      acc[conferenceId] = [];
    }
    acc[conferenceId].push(segment);
    return acc;
  }, {});
  
  console.log(`Found segments for ${Object.keys(segmentsByConference).length} conferences`);
  
  // Log summary stats
  Object.entries(segmentsByConference).forEach(([conferenceId, segments]) => {
    console.log(`Conference ${conferenceId}: ${segments.length} segments`);
  });
  
  return segmentsByConference;
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
 * Check if user segment already exists in Strapi
 */
async function checkUserSegmentExists(oldId) {
  try {
    const response = await makeApiRequest(`user-segments?filters[old_id][$eq]=${oldId}`);
    return response.data && response.data.length > 0;
  } catch (error) {
    console.error('Error checking if user segment exists:', error.message);
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
 * Create a single user segment in Strapi
 */
async function createUserSegment(segment) {
  // Look up the conference documentId using segment.conference
  const conferenceDocumentId = await findConferenceDocumentId(segment.conference);
  
  if (!conferenceDocumentId) {
    console.warn(`Conference not found for old_id: ${segment.conference}`);
  }
  
  const data = {
    data: {
      old_id: segment.old_id,
      name: segment.name,
      description: segment.description,
      conference: conferenceDocumentId, // Use the documentId for the relation
    }
  };
  
  try {
    return await makeApiRequest('user-segments', 'POST', data);
  } catch (error) {
    console.error(`Failed to create user segment ${segment.old_id}:`, error.message);
    throw error;
  }
}

/**
 * Import user segments to Strapi in batches
 */
async function importUserSegmentsToStrapi(userSegments) {
  console.log(`Starting import of ${userSegments.length} user segments to Strapi...`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;

  // Process in batches
  for (let i = 0; i < userSegments.length; i += BATCH_SIZE) {
    const batch = userSegments.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(userSegments.length/BATCH_SIZE)} (${batch.length} segments)`);

    for (const segment of batch) {
      try {
        // Check if segment already exists
        const exists = await checkUserSegmentExists(segment.old_id);
        
        if (exists) {
          console.log(`Skipping existing segment: ${segment.old_id} - ${segment.description}`);
          skipped++;
        } else {
          // Create new segment
          await createUserSegment(segment);
          console.log(`Imported segment: ${segment.old_id} - ${segment.description}`);
          imported++;
        }
      } catch (error) {
        console.error(`Error processing segment ${segment.old_id}:`, error.message);
        errors++;
      }
    }

    // Small delay between batches to be gentle on the API
    if (i + BATCH_SIZE < userSegments.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n--- Import Summary ---');
  console.log(`Total processed: ${userSegments.length}`);
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
    console.log('Conferences endpoint failed, trying user-segments...');
    try {
      await makeApiRequest('user-segments?pagination[limit]=1');
      console.log('✅ Strapi connection successful via user-segments');
      return true;
    } catch (segmentError) {
      console.error('❌ Strapi connection failed:', segmentError.message);
      console.error('Make sure Strapi is running on', STRAPI_BASE_URL);
      if (!STRAPI_API_TOKEN) {
        console.error('Consider setting STRAPI_API_TOKEN environment variable for authenticated requests');
        console.error('Or make sure the user-segments collection type is publicly accessible in Strapi permissions');
      }
      return false;
    }
  }
}

/**
 * Main function to execute the import
 */
async function main() {
  console.log('Starting UserSegment JSON import to Strapi...');
  
  // Test Strapi connection first
  const connected = await testStrapiConnection();
  if (!connected) {
    console.log('Import aborted due to connection issues');
    return;
  }
  
  // Load the JSON data
  const userSegments = await loadUserSegmentData();
  
  if (!userSegments) {
    console.log('Import failed - no data loaded');
    return;
  }

  // Process the data
  const processedData = await processUserSegments(userSegments);
  
  // Import to Strapi
  const result = await importUserSegmentsToStrapi(userSegments);
  
  console.log('\n🎉 Import process completed!');
  
  if (result.errors > 0) {
    console.log('⚠️  Some segments failed to import. Check the logs above for details.');
  }
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  loadUserSegmentData,
  processUserSegments,
  makeApiRequest,
  getAllConferences,
  findConferenceDocumentId,
  createUserSegment,
  importUserSegmentsToStrapi,
  testStrapiConnection,
  main
};
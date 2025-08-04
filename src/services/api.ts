const API_BASE_URL = 'http://localhost:8000';

// Generic API Response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// Construction Events API Functions
export interface ConstructionEvent {
  id: string;
  date: string;
  title: string;
  url?: string;
  poster?: string;
  description?: string;
  mediaType?: 'video' ;
  completionPercentageAtEvent: number;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  expected_date?: string;
}

export interface CreateConstructionEventData {
  date: string;
  title: string;
  url?: string;
  poster?: string;
  description?: string;
  mediaType?: 'video' ;
  completionPercentageAtEvent: number;
  expected_date?: string;
}

export interface UpdateConstructionEventData {
  date?: string;
  title?: string;
  url?: string;
  poster?: string;
  description?: string;
  mediaType?: 'video' ;
  completionPercentageAtEvent?: number;
  isCompleted?: boolean;
  expected_date?: string;
}

// Get all construction events
export async function getConstructionEvents(): Promise<ApiResponse<ConstructionEvent[]>> {
  try {
    const url = `${API_BASE_URL}/api/construction-events`;
    console.log('Fetching construction events from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return { 
        success: false, 
        message: 'Failed to fetch construction events',
        data: [] 
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching construction events:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Network error',
      data: [] 
    };
  }
}

// Create a new construction event
export async function createConstructionEvent(eventData: CreateConstructionEventData): Promise<ApiResponse<ConstructionEvent>> {
  try {
    const url = `${API_BASE_URL}/api/construction-events`;
    console.log('🌐 Creating construction event at:', url);
    console.log('📤 Request data:', eventData);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    
    if (!response.ok) {
      console.error(`❌ HTTP error! status: ${response.status}`);
      let errorMessage = 'Failed to create construction event';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.log('❌ Error data:', errorData);
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
        console.log('❌ Response text:', await response.text());
      }
      return { 
        success: false, 
        message: errorMessage,
        data: undefined
      };
    }
    
    const responseData = await response.json();
    console.log('✅ Success response data:', responseData);
    return responseData;
  } catch (error) {
    console.error('💥 Network error creating construction event:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Network error',
      data: undefined
    };
  }
}

// Update a construction event
export async function updateConstructionEvent(eventId: string, eventData: UpdateConstructionEventData): Promise<ApiResponse<ConstructionEvent>> {
  try {
    const url = `${API_BASE_URL}/api/construction-events/${eventId}`;
    console.log('🌐 Updating construction event at:', url);
    console.log('📤 Request data:', eventData);
    
    const requestBody = JSON.stringify(eventData);
    console.log('📤 Request body:', requestBody);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    
    if (!response.ok) {
      console.error(`❌ HTTP error! status: ${response.status}`);
      console.error(`❌ Response status text: ${response.statusText}`);
      console.error(`❌ Response headers:`, Object.fromEntries(response.headers.entries()));
      
      let errorMessage = 'Failed to update construction event';
      let errorDetails = '';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorDetails = JSON.stringify(errorData, null, 2);
        console.log('❌ Error data:', errorData);
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
        try {
          const responseText = await response.text();
          errorDetails = responseText;
          console.log('❌ Response text:', responseText);
        } catch {
          console.log('❌ Could not read response text');
        }
      }
      
      console.error(`❌ Full error details: ${errorDetails}`);
      
      return { 
        success: false, 
        message: `${errorMessage} (Status: ${response.status})`,
        data: undefined
      };
    }
    
    let responseData;
    try {
      responseData = await response.json();
      console.log('✅ Success response data:', responseData);
    } catch (parseError) {
      console.error('❌ Failed to parse response JSON:', parseError);
      return {
        success: false,
        message: 'Invalid response format from server',
        data: undefined
      };
    }
    return responseData;
  } catch (error) {
    console.error('💥 Network error updating construction event:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Network error',
      data: undefined
    };
  }
}

// Delete a construction event
export async function deleteConstructionEvent(eventId: string): Promise<ApiResponse> {
  try {
    const url = `${API_BASE_URL}/api/construction-events/${eventId}`;
    console.log('Deleting construction event at:', url);
    
    const response = await fetch(url, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return { 
        success: false, 
        message: 'Failed to delete construction event',
        data: undefined
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting construction event:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Network error',
      data: undefined
    };
  }
} 

// File Upload API Functions
export const baseURL = `${API_BASE_URL}/api`;

export const fetchPolicyAPI = async (filePath: string) => {
  const config = {
    method: "post",
    url: `${baseURL}/filemanager/upload-policy/`,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      fileName: filePath,
    }),
  };
  return await fetch(config.url, {
    method: config.method,
    headers: config.headers,
    body: config.data,
  });
};

interface PolicyData {
  key: string;
  policy: string;
  'x-amz-algorithm': string;
  'x-amz-credential': string;
  'x-amz-date': string;
  'x-amz-signature': string;
  bucket: string;
  contentId: string;
}

export const getS3FormData = (policyData: PolicyData, file: File) => {
  const {
    key: policyKey,
    policy,
    "x-amz-algorithm": algorithm,
    "x-amz-credential": credential,
    "x-amz-date": date,
    "x-amz-signature": signature,
    bucket,
    contentId,
  } = policyData;
  const fd = new FormData();
  fd.append("key", policyKey);
  fd.append("Policy", policy);
  fd.append("X-Amz-Algorithm", algorithm);
  fd.append("X-Amz-Credential", credential);
  fd.append("X-Amz-Date", date);
  fd.append("X-Amz-Signature", signature);
  fd.append("x-amz-meta-contentid", contentId);
  // file field must be the last field in the form.
  fd.append("file", file);
  return { form: fd, bucket, policyKey };
};

interface S3Response {
  status: number;
  data: string;
}

export const uploadFileOnS3 = async (form: FormData, bucket: string, onUploadProgress?: (progress: number) => void): Promise<S3Response> => {
  const xhr = new XMLHttpRequest();
  
  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onUploadProgress) {
        const progress = Math.round((e.loaded * 100) / e.total);
        onUploadProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 204) {
        resolve({ status: 204, data: xhr.responseText });
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', `https://${bucket}.s3.amazonaws.com/`);
    xhr.send(form);
  });
};

export const createNewContent = async (filePath: string, contentId: string) => {
  const config = {
    method: "post",
    url: `${baseURL}/filemanager/content`,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      filePath,
      contentId,
    }),
  };

  return await fetch(config.url, {
    method: config.method,
    headers: config.headers,
    body: config.data,
  });
};

export const getCDNUrl = async (content_id: string) => {
  const config = {
    method: "post",
    url: `${baseURL}/filemanager/content/getcdnurl`,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      content_id,
    }),
  };
  return await fetch(config.url, {
    method: config.method,
    headers: config.headers,
    body: config.data,
  });
};

export const fileUpload = async (file: File, onUploadProgress?: (progress: number) => void): Promise<string | false> => {
  try {
    const response = await fetchPolicyAPI(file.name);
    const policyData = await response.json();

    const { form, bucket, policyKey } = getS3FormData(policyData, file);

    const s3Response = await uploadFileOnS3(form, bucket, onUploadProgress);

    if (s3Response.status === 204) {
      const contentCreateResponse = await createNewContent(
        policyKey,
        policyData.contentId
      );
      const contentCreateData = await contentCreateResponse.json();
      const { contentid } = contentCreateData;
      const CDNUrlResponse = await getCDNUrl(contentid);
      const cdnData = await CDNUrlResponse.json();
      return cdnData.url;
    }
    return false;
  } catch (error) {
    console.error('File upload error:', error);
    return false;
  }
}; 
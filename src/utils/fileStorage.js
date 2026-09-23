const DB_NAME = 'studysync_files';
const STORE_NAME = 'materials';
const CHAT_STORE_NAME = 'chats';
const DB_VERSION = 2;

let dbPromise = null;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error("IndexedDB is not supported by this browser."));
        return;
      }
      
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = (event) => {
        reject(new Error("IndexedDB opening error: " + event.target.error));
      };
      
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'fileId' });
        }
        if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
          db.createObjectStore(CHAT_STORE_NAME, { keyPath: 'fileId' });
        }
      };
    });
  }
  return dbPromise;
};

export const saveFile = async (fileId, subjectId, unitId, fileBlob) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const record = {
      fileId,
      subjectId,
      unitId,
      name: fileBlob.name,
      type: fileBlob.type,
      size: fileBlob.size,
      blob: fileBlob,
      timestamp: new Date().toISOString(),
      generationStatus: 'idle'
    };
    
    const request = store.put(record);
    
    request.onsuccess = () => resolve(fileId);
    request.onerror = (event) => reject(new Error("Failed to save file: " + event.target.error));
  });
};

export const getFile = async (fileId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(fileId);
    
    request.onsuccess = (event) => {
      resolve(event.target.result || null);
    };
    
    request.onerror = (event) => reject(new Error("Failed to get file: " + event.target.error));
  });
};

export const deleteFile = async (fileId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME, CHAT_STORE_NAME], 'readwrite');
    const materialStore = transaction.objectStore(STORE_NAME);
    materialStore.delete(fileId);
    
    if (db.objectStoreNames.contains(CHAT_STORE_NAME)) {
      const chatStore = transaction.objectStore(CHAT_STORE_NAME);
      chatStore.delete(fileId);
    }
    
    transaction.oncomplete = () => resolve();
    transaction.onerror = (event) => reject(new Error("Failed to delete file: " + event.target.error));
  });
};
  
export const updateFileGeneratedData = async (fileId, generatedData) => {  
  const db = await initDB();  
  return new Promise((resolve, reject) => {  
    const transaction = db.transaction([STORE_NAME], 'readwrite');  
    const store = transaction.objectStore(STORE_NAME);  
    const getRequest = store.get(fileId);  
    getRequest.onsuccess = (event) => {  
      const record = event.target.result;  
      if (record) {  
        record.generatedData = generatedData;  
        record.generationStatus = 'completed';
        const putRequest = store.put(record);  
        putRequest.onsuccess = () => resolve();  
        putRequest.onerror = (e) => reject(new Error("Failed to update generated data: " + e.target.error));  
      } else {  
        reject(new Error("File record not found"));  
      }  
    };  
    getRequest.onerror = (event) => reject(new Error("Failed to get file for update: " + event.target.error));  
  });  
};  

export const updateFileGenerationStatus = async (fileId, status) => {  
  const db = await initDB();  
  return new Promise((resolve, reject) => {  
    const transaction = db.transaction([STORE_NAME], 'readwrite');  
    const store = transaction.objectStore(STORE_NAME);  
    const getRequest = store.get(fileId);  
    getRequest.onsuccess = (event) => {  
      const record = event.target.result;  
      if (record) {  
        record.generationStatus = status;  
        const putRequest = store.put(record);  
        putRequest.onsuccess = () => resolve();  
        putRequest.onerror = (e) => reject(new Error("Failed to update status: " + e.target.error));  
      } else {  
        reject(new Error("File record not found"));  
      }  
    };  
    getRequest.onerror = (event) => reject(new Error("Failed to get file for update: " + event.target.error));  
  });  
};
  
export const getFileGeneratedData = async (fileId) => {  
  const record = await getFile(fileId);  
  return record ? record.generatedData : null;  
};

export const getFilesBySubject = async (subjectId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = (event) => {
      const allFiles = event.target.result || [];
      const subjectFiles = allFiles.filter(f => f.subjectId === subjectId);
      resolve(subjectFiles);
    };
    
    request.onerror = (event) => reject(new Error("Failed to get files: " + event.target.error));
  });
};

export const getChatHistory = async (fileId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
      return resolve([]);
    }
    const transaction = db.transaction([CHAT_STORE_NAME], 'readonly');
    const store = transaction.objectStore(CHAT_STORE_NAME);
    const request = store.get(fileId);
    
    request.onsuccess = (event) => {
      const record = event.target.result;
      resolve(record ? record.history : []);
    };
    
    request.onerror = (event) => reject(new Error("Failed to get chat history: " + event.target.error));
  });
};

export const saveChatHistory = async (fileId, history) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
      return reject(new Error("Chat store not initialized"));
    }
    const transaction = db.transaction([CHAT_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(CHAT_STORE_NAME);
    
    const request = store.put({
      fileId,
      history,
      lastUpdated: new Date().toISOString()
    });
    
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(new Error("Failed to save chat history: " + event.target.error));
  });
};

export const clearChatHistory = async (fileId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    if (!db.objectStoreNames.contains(CHAT_STORE_NAME)) {
      return resolve();
    }
    const transaction = db.transaction([CHAT_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(CHAT_STORE_NAME);
    const request = store.delete(fileId);
    
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(new Error("Failed to clear chat history: " + event.target.error));
  });
};

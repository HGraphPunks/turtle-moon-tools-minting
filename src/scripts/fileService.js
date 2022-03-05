import { Blob, NFTStorage, File } from "nft.storage";



export const createSingleIPFSMetaData = async (file, metaData, nftStorageAPI) => {
  return new Promise(async (resolve, reject) => {
    const NFT_STORAGE_API_KEY = nftStorageAPI
    const nftStorageClient = new NFTStorage({ token: NFT_STORAGE_API_KEY });
    console.log(file.type)
    const fileType = () => {
      switch(file.type) {
        case 'image/png': 
          return '.png'
        case 'image/jpg':
          return '.jpg'
        case 'image/gif':
          return '.gif'
        case 'video/quicktime':
            return '.mp4'
        default:
          return null
      }
    }
    const metadataCID = await nftStorageClient.store({
      ...metaData,
      image: new File([file], `${metaData?.name}${fileType()}`, {
        type: file.type,
      })
    })
    console.log(metadataCID)
    resolve(metadataCID)
  })
}


export const createIPFSMetaData = async (hashLipsImages, hashlipsMetaData, nftStorageAPI) => {
  return new Promise(async (resolve, reject) => {

    const hashLipsImagesArray = Array.from(hashLipsImages)
    const numOfNFTS = hashLipsImagesArray.length;
    const numOfMetadata = hashlipsMetaData.length;

    if (numOfNFTS !== numOfMetadata) {
      console.error('Num of images and metadata are not matching. Check the files and JSON uploaded')
      reject();
    }

    // Set NFT Storage API Key and Create NFT Storage Client
    const NFT_STORAGE_API_KEY = nftStorageAPI;
    const nftStorageClient = new NFTStorage({ token: NFT_STORAGE_API_KEY });

    // Sort file list from upload to match metadata JSON from Hashlips. 
    // Updating order to [1.png, 2.png, etc]
    const sortedHashLipsImagesArray = hashLipsImagesArray.sort((a, b) => (parseInt(a.name.split('.')[0]) > parseInt(b.name.split('.')[0])) ? 1 : -1)
    
    // // Crate Array for CIDs
    let metaDataCIDs = [];
      for (let index = 0; index < hashlipsMetaData.length; index++) {
        const fileType = () => {
          switch(sortedHashLipsImagesArray[index].type) {
            case 'image/png': 
              return '.png'
            case 'image/jpg':
              return '.jpg'
            case 'image/gif':
              return '.gif'
            case 'video/quicktime':
              return '.mp4'
            default:
              return null
          }
        }
        const metadata = await nftStorageClient.store({
          ...hashlipsMetaData[index],
          image: new File([sortedHashLipsImagesArray[index]], `${index}${fileType()}`, {
            type: sortedHashLipsImagesArray[index].type,
          })
        })
        metaDataCIDs.push(metadata.url);
        if (metaDataCIDs.length -1 === hashlipsMetaData.length -1) resolve(metaDataCIDs)
      }
  });

}

export const uploadFile = async (event, token, setToken) => {
  /* Only support gif /png /jpg for viewing */
  const image = event?.target?.files[0]
  const base64Image= await convertToBase64(image);
  const fileType = () => {
    switch(image.type) {
      case 'image/png': 
        return '.png'
      case 'image/jpg':
        return '.jpg'
      case 'image/gif':
        return '.gif'
      default:
        return null
    }
  }
  setToken({
      ...token,
      imageData: base64Image,
      imageType: fileType(),
      photoSize: image.size,
  })
}

export const uploadHashLipsFiles = async (token, setToken) => {
  /* Only support gif /png /jpg for viewing */

  const base64Image= await convertToBase64(image);
  const imgType = () => {
    switch(image.type) {
      case 'image/png': 
        return '.png'
      case 'image/jpg':
        return '.jpg'
      case 'image/gif':
        return '.gif'
      case 'video/quicktime':
        return '.mp4'
      default:
        return null
    }
  }
  
}



export const uploadJSON = async (event) => {
  /* Only support gif /png /jpg for viewing */
  const json = event?.target?.files[0];
  console.log(json)

  // const base64Image= await convertToBase64(image);
  // const imgType = () => {
  //   switch(image.type) {
  //     case 'image/png': 
  //       return '.png'
  //     case 'image/jpg':
  //       return '.jpg'
  //     case 'image/gif':
  //       return '.gif'
  //     default:
  //       return null
  //   }
  // }
}

export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};
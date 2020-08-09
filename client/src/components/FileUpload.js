import React, { Fragment, useState } from 'react';
import Message from './Message';
import Progress from './Progress';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState('');
  const [cropDone, setCropDone] = useState(false);
  const [messageType, setMessageType] = useState('info');
  const [filename, setFilename] = useState('Choose File');
  const [message, setMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);
  const [croppedFiles, setCroppedFiles] = useState([]);
  const crops = [];
  const _URL = window.URL || window.webkitURL;

  const onChange = (e) => {
    setFile(e.target.files[0]);
    setFilename(e.target.files[0].name);
  };

  const dataURIToBlob = (dataURI) => {
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(',')[1]);

    // write the bytes of the string to an ArrayBuffer
    var arrayBuffer = new ArrayBuffer(byteString.length);
    var _ia = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
      _ia[i] = byteString.charCodeAt(i);
    }

    var dataView = new DataView(arrayBuffer);
    var blob = new Blob([dataView], { type: 'image/jpeg' });
    return blob;
  };
  const imageSizeSatisfied = (file) => {
    var img;
    img = new Image();
    var objectUrl = _URL.createObjectURL(file);
    img.onload = function () {
      if (this.width !== 1024 || this.height !== 1024) {
        _URL.revokeObjectURL(objectUrl);
        return false;
      }
      _URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
    return true;
  };

  const cropImage = (file) => {
    let inputImage = new Image();
    var objectUrl = _URL.createObjectURL(file);

    // we want to wait for our image to load
    inputImage.onload = () => {
      // let's store the width and height of our image
      const inputWidth = inputImage.naturalWidth;
      const inputHeight = inputImage.naturalHeight;

      // Set the output images dimensions
      let outputWidth1 = 755;
      let outputHeight1 = 450;

      let outputWidth2 = 365;
      let outputHeight2 = 450;

      let outputWidth3 = 365;
      let outputHeight3 = 212;

      let outputWidth4 = 380;
      let outputHeight4 = 380;

      // calculate the position to draw the image at
      const outputX1 = (outputWidth1 - inputWidth) * 0.5;
      const outputY1 = (outputHeight1 - inputHeight) * 0.5;

      const outputX2 = (outputWidth2 - inputWidth) * 0.5;
      const outputY2 = (outputHeight2 - inputHeight) * 0.5;

      const outputX3 = (outputWidth3 - inputWidth) * 0.5;
      const outputY3 = (outputHeight3 - inputHeight) * 0.5;

      const outputX4 = (outputWidth4 - inputWidth) * 0.5;
      const outputY4 = (outputHeight4 - inputHeight) * 0.5;

      // create a canvas that will present the output image
      const outputImage1 = document.createElement('canvas');
      const outputImage2 = document.createElement('canvas');
      const outputImage3 = document.createElement('canvas');
      const outputImage4 = document.createElement('canvas');

      // set it to the same size as the image
      outputImage1.width = outputWidth1;
      outputImage1.height = outputHeight1;

      outputImage2.width = outputWidth2;
      outputImage2.height = outputHeight2;

      outputImage3.width = outputWidth3;
      outputImage3.height = outputHeight3;

      outputImage4.width = outputWidth4;
      outputImage4.height = outputHeight4;

      // draw our image at position 0, 0 on the canvas
      const ctx1 = outputImage1.getContext('2d');
      ctx1.drawImage(inputImage, outputX1, outputY1);

      const ctx2 = outputImage2.getContext('2d');
      ctx2.drawImage(inputImage, outputX2, outputY2);

      const ctx3 = outputImage3.getContext('2d');
      ctx3.drawImage(inputImage, outputX3, outputY3);

      const ctx4 = outputImage4.getContext('2d');
      ctx4.drawImage(inputImage, outputX4, outputY4);

      // show both the image and the canvas
      document.body.appendChild(outputImage1);
      document.body.appendChild(outputImage2);
      document.body.appendChild(outputImage3);
      document.body.appendChild(outputImage4);

      crops.push(dataURIToBlob(outputImage1.toDataURL()));

      crops.push(dataURIToBlob(outputImage2.toDataURL()));

      crops.push(dataURIToBlob(outputImage3.toDataURL()));

      crops.push(dataURIToBlob(outputImage4.toDataURL()));
      setCroppedFiles([...crops]);
    };

    // start loading our image
    inputImage.src = objectUrl;
    setCropDone(true);
  };

  const sendFormDataToServer = async (formData) => {
    try {
      await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          setUploadPercentage(
            parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
          );

          // Clear percentage
          setTimeout(() => setUploadPercentage(0), 10000);
        },
      });

      setMessage('File Uploaded');
    } catch (err) {
      if (err.response.status === 500) {
        setMessage('There was a problem with the server');
      } else {
        setMessage(err.response.data.msg);
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!imageSizeSatisfied(file)) {
      setMessageType('warning');
      return setMessage('Image size must be 1024 * 1024');
    }
    let formData = new FormData();
    for (let i = 0; i < croppedFiles.length; ++i) {
      formData = new FormData();
      formData.append('file', croppedFiles[i]);
      sendFormDataToServer(formData);
    }
  };

  if (file && !cropDone) {
    cropImage(file);
  }

  return (
    <Fragment>
      {message ? <Message msg={message} type={messageType} /> : null}
      <form onSubmit={onSubmit}>
        <div className='custom-file mb-4'>
          <input
            type='file'
            className='custom-file-input'
            id='customFile'
            onChange={onChange}
          />
          <label className='custom-file-label' htmlFor='customFile'>
            {filename}
          </label>
        </div>

        <Progress percentage={uploadPercentage} />

        <input
          type='submit'
          value='Upload'
          className='btn btn-primary btn-block mt-4'
        />
        {'\n'}
      </form>
    </Fragment>
  );
};

export default FileUpload;

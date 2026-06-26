import React from 'react';

interface Props {
  settings: any; // Use a specific type if possible
}

const AdPreview: React.FC<Props> = ({ settings }) => {
  const generateHtml = () => {
    if (settings.type === 'banner') {
      return `
       <div style="background-color: ${
         settings.banner.backgroundColor
       }; padding: 20px; text-align: center; display:flex; flex-direction:column">
        <img src="${settings.banner.imageUrl}" alt="Banner" style="max-width: 100%;"/>
        <a 
            href="${settings.banner.destinationUrl}" 
            style="display: inline-block; margin-top: 10px; padding: 10px 20px; color: white; background-color: ${
              settings.banner.buttonColor
            }; text-decoration: none; border 1px;  border-radius: 5px">
            ${settings.banner.buttonText} (<span id="countdown">${settings.video.non_skip || 5}</span>s)
        </a>
        </div>
      `;
    }
    if (settings.type === 'video') {
      return `
        <div style="background-color: ${
          settings.banner.backgroundColor
        }; padding: 20px; text-align: center; display:flex; flex-direction:column">
          <video src="${settings.video.videoUrl}" style="max-width: 100%; height: auto;" ${settings.video.nonSkip ? '' : 'controls'}>
          </video>
          <a href="${
            settings.video.destinationUrl
          }" style="display: inline-block; margin-top: 10px; padding: 10px 20px; color: white; background-color: ${
        settings.banner.buttonColor || '#0000ff'
      }; text-decoration: none; border 1px;  border-radius: 5px">
             ${settings.banner.buttonText} (<span id="countdown">${settings.video.non_skip || 5}</span>s)
          </a>
        </div>
      `;
    }
    return '<div>Preview not available for this type</div>';
  };

  return (
    <iframe
      srcDoc={generateHtml()}
      style={{ width: '100%', height: '100%', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: 'white' }}
      title="Ad Preview"
    ></iframe>
  );
};

export default AdPreview;

import React from 'react';

const stickers = [1, 2, 3, 4, 5, 6, 7]; // IDs de los stickers

const StickerMenu = ({ selectedSticker, onSelect }) => {
  return (
    <div className="sticker-ui-container">

      
      <div className="sticker-bar">
        {stickers.map((id) => (
          <div 
            key={id}
            className={`sticker-btn ${selectedSticker === id ? 'selected' : ''}`}
            onClick={() => onSelect(id)}
          >
            {/* Cargamos desde la carpeta public */}
            <img src={`/stickers/s${id}.png`} alt={`Sticker ${id}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default StickerMenu;
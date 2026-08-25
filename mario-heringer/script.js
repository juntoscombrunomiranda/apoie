const canvasContainer = document.getElementById('canvas-container');
const chooseFileBtn = document.getElementById('choose-file');
const fileInput = document.getElementById('file-input');
const downloadButton = document.getElementById('download');
const frameSwitch = document.querySelectorAll('input[name="frameOption"]');

let stage, sampleLayer, photoLayer, frameLayer, overlayLayer;
let photo, transformer;
let lastDistance = 0;

// Objetos de moldura pré-carregados
let frameBMImg, frameBMKImg;


// =====================================================
// NOTIFICAÇÃO
// =====================================================

const notification = document.createElement('div');

notification.style.position = 'fixed';
notification.style.bottom = '20px';
notification.style.left = '50%';
notification.style.transform = 'translateX(-50%)';
notification.style.backgroundColor = '#8bd96c';
notification.style.color = '#0030b5';
notification.style.borderRadius = '10px';
notification.style.fontWeight = '600';
notification.style.fontFamily = 'Montserrat, sans-serif';
notification.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
notification.style.display = 'none';
notification.style.zIndex = '9999';
notification.style.minWidth = '250px';
notification.style.maxWidth = '90%';
notification.style.textAlign = 'center';
notification.style.wordWrap = 'break-word';

const adjustNotificationStyle = () => {

  if (window.innerWidth <= 480) {

    notification.style.padding = '20px 15px';
    notification.style.fontSize = '1rem';

  } else {

    notification.style.padding = '15px 25px';
    notification.style.fontSize = '1rem';

  }

};

adjustNotificationStyle();

window.addEventListener(
  'resize',
  adjustNotificationStyle
);

document.body.appendChild(notification);


// =====================================================
// MOSTRAR NOTIFICAÇÃO
// =====================================================

const showNotification = (
  msg,
  duration = 5000
) => {

  notification.textContent = msg;

  notification.style.display = 'block';
  notification.style.opacity = '0';
  notification.style.transition =
    'opacity 0.4s ease';

  requestAnimationFrame(() => {

    notification.style.opacity = '1';

  });

  setTimeout(() => {

    notification.style.opacity = '0';

    setTimeout(() => {

      notification.style.display = 'none';

    }, 400);

  }, duration);

};


// =====================================================
// DETECTAR iPHONE / iPAD
// =====================================================

const isIOS = () => {

  return (
    /iPad|iPhone|iPod/.test(
      navigator.userAgent
    ) ||
    (
      navigator.platform === 'MacIntel' &&
      navigator.maxTouchPoints > 1
    )
  );

};


// =====================================================
// INICIALIZAÇÃO DO CANVAS
// =====================================================

const initCanvas = () => {

  const containerSize =
    canvasContainer.offsetWidth;

  stage = new Konva.Stage({

    container: 'canvas-container',

    width: containerSize,
    height: containerSize

  });


  // ===================================================
  // SAMPLE
  // ===================================================

  sampleLayer = new Konva.Layer();

  stage.add(sampleLayer);

  const sample = new Image();

  sample.src = 'sample.png';

  sample.onload = () => {

    const sampleImg =
      new Konva.Image({

        x: 0,
        y: 0,

        image: sample,

        width: stage.width(),
        height: stage.height(),

        listening: false

      });

    sampleLayer.add(sampleImg);

    sampleLayer.draw();

  };


  // ===================================================
  // FOTO DO USUÁRIO
  // ===================================================

  photoLayer = new Konva.Layer();

  stage.add(photoLayer);

  transformer = new Konva.Transformer({

    nodes: [],

    rotateEnabled: false,

    enabledAnchors: [
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right'
    ]

  });

  photoLayer.add(transformer);


  // ===================================================
  // CAMADA DAS MOLDURAS
  // ===================================================

  frameLayer = new Konva.Layer();

  stage.add(frameLayer);


  // ===================================================
  // MOLDURA BRUNO + MÁRIO
  // ===================================================

  const bmImg = new Image();

  bmImg.src = 'Twibbon-BM.png';

  bmImg.onload = () => {

    frameBMImg =
      new Konva.Image({

        x: 0,
        y: 0,

        image: bmImg,

        width: stage.width(),
        height: stage.height(),

        visible: true,

        listening: false

      });

    frameLayer.add(frameBMImg);

    frameLayer.draw();

  };


  // ===================================================
  // MOLDURA + KALIL
  // ===================================================

  const bmkImg = new Image();

  bmkImg.src = 'Twibbon-BMK.png';

  bmkImg.onload = () => {

    frameBMKImg =
      new Konva.Image({

        x: 0,
        y: 0,

        image: bmkImg,

        width: stage.width(),
        height: stage.height(),

        visible: false,

        listening: false

      });

    frameLayer.add(frameBMKImg);

    frameLayer.draw();

  };


  // ===================================================
  // OVERLAY
  // ===================================================

  overlayLayer = new Konva.Layer();

  stage.add(overlayLayer);

  const overlayStatic = new Image();

  overlayStatic.src = 'overlay.png';

  overlayStatic.onload = () => {

    const overlayImg =
      new Konva.Image({

        x: 0,
        y: 0,

        image: overlayStatic,

        width: stage.width(),
        height: stage.height(),

        listening: false

      });

    overlayLayer.add(overlayImg);

    overlayLayer.draw();

  };


  // ===================================================
  // ZOOM COM SCROLL
  // ===================================================

  stage.on('wheel', (e) => {

    if (!photo) return;

    e.evt.preventDefault();

    const oldScale =
      photo.scaleX();

    const pointer =
      stage.getPointerPosition();

    const scaleBy = 1.05;

    const direction =
      e.evt.deltaY > 0
        ? 1 / scaleBy
        : scaleBy;

    photo.scaleX(
      photo.scaleX() * direction
    );

    photo.scaleY(
      photo.scaleY() * direction
    );

    const mousePointTo = {

      x:
        (pointer.x - photo.x()) /
        oldScale,

      y:
        (pointer.y - photo.y()) /
        oldScale

    };

    photo.x(
      pointer.x -
      mousePointTo.x *
      photo.scaleX()
    );

    photo.y(
      pointer.y -
      mousePointTo.y *
      photo.scaleY()
    );

    photoLayer.draw();

  });

};


// =====================================================
// SWITCH DE MOLDURA
// =====================================================

frameSwitch.forEach(input => {

  input.addEventListener(
    'change',
    () => {

      // Bruno + Mário
      if (input.value === 'bm') {

        if (frameBMImg) {

          frameBMImg.visible(true);

        }

        if (frameBMKImg) {

          frameBMKImg.visible(false);

        }

      }


      // + Kalil
      if (input.value === 'bmk') {

        if (frameBMImg) {

          frameBMImg.visible(false);

        }

        if (frameBMKImg) {

          frameBMKImg.visible(true);

        }

      }

      frameLayer.draw();

    }
  );

});


// =====================================================
// ESCOLHER ARQUIVO
// =====================================================

chooseFileBtn.addEventListener(
  'click',
  () => {

    fileInput.value = '';

    fileInput.click();

  }
);


// =====================================================
// UPLOAD DA FOTO
// =====================================================

fileInput.addEventListener(
  'change',
  (e) => {

    const file =
      e.target.files[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = () => {

      const img = new Image();

      img.src = reader.result;

      img.onload = () => {

        const containerSize =
          stage.width();

        const scaleX =
          containerSize /
          img.width;

        const scaleY =
          containerSize /
          img.height;

        const finalScale =
          Math.max(
            scaleX,
            scaleY
          );

        const finalWidth =
          img.width *
          finalScale;

        const finalHeight =
          img.height *
          finalScale;

        const finalX =
          (
            containerSize -
            finalWidth
          ) / 2;

        const finalY =
          (
            containerSize -
            finalHeight
          ) / 2;


        sampleLayer.destroyChildren();

        sampleLayer.draw();


        if (!photo) {

          photo =
            new Konva.Image({

              x: finalX,
              y: finalY,

              image: img,

              width: finalWidth,
              height: finalHeight,

              draggable: true,

              scaleX: 0,
              scaleY: 0

            });

          photoLayer.add(photo);

          transformer.nodes([photo]);

        } else {

          photo.image(img);

          photo.setAttrs({

            x: finalX,
            y: finalY,

            width: finalWidth,
            height: finalHeight,

            scaleX: 0,
            scaleY: 0

          });

        }


        const tween =
          new Konva.Tween({

            node: photo,

            duration: 0.5,

            scaleX: 1,
            scaleY: 1,

            easing:
              Konva.Easings.EaseInOut

          });

        tween.play();


        overlayLayer.moveToTop();

        frameLayer.draw();
        photoLayer.draw();


        chooseFileBtn.textContent =
          'Escolher outra';

        downloadButton.style.display =
          'inline-block';

      };

    };

    reader.readAsDataURL(file);

  }
);


// =====================================================
// PINCH-TO-ZOOM NO CELULAR
// =====================================================

canvasContainer.addEventListener(
  'touchmove',
  (e) => {

    if (
      !photo ||
      e.touches.length !== 2
    ) return;

    e.preventDefault();

    const touch1 =
      e.touches[0];

    const touch2 =
      e.touches[1];

    const dx =
      touch2.clientX -
      touch1.clientX;

    const dy =
      touch2.clientY -
      touch1.clientY;

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );


    if (lastDistance) {

      const scaleChange =
        distance /
        lastDistance;

      photo.scaleX(
        photo.scaleX() *
        scaleChange
      );

      photo.scaleY(
        photo.scaleY() *
        scaleChange
      );


      const centerX =
        (
          touch1.clientX +
          touch2.clientX
        ) / 2 -
        canvasContainer
          .getBoundingClientRect()
          .left;

      const centerY =
        (
          touch1.clientY +
          touch2.clientY
        ) / 2 -
        canvasContainer
          .getBoundingClientRect()
          .top;


      const oldScale =
        photo.scaleX() /
        scaleChange;


      photo.x(
        centerX -
        (
          centerX -
          photo.x()
        ) *
        (
          photo.scaleX() /
          oldScale
        )
      );

      photo.y(
        centerY -
        (
          centerY -
          photo.y()
        ) *
        (
          photo.scaleY() /
          oldScale
        )
      );

    }


    lastDistance = distance;

    overlayLayer.moveToTop();

    photoLayer.draw();

  }
);


canvasContainer.addEventListener(
  'touchend',
  (e) => {

    if (
      e.touches.length < 2
    ) {

      lastDistance = 0;

    }

  }
);


// =====================================================
// DOWNLOAD DA FOTO
// =====================================================

downloadButton.addEventListener(
  'click',
  () => {

    if (!photo) return;

    const downloadSize = 800;

    const mergedCanvas =
      document.createElement(
        'canvas'
      );

    mergedCanvas.width =
      downloadSize;

    mergedCanvas.height =
      downloadSize;

    const ctx =
      mergedCanvas.getContext(
        '2d'
      );


    ctx.fillStyle =
      '#ffffff';

    ctx.fillRect(
      0,
      0,
      downloadSize,
      downloadSize
    );


    const scaleX =
      photo.width() *
      photo.scaleX() /
      stage.width();

    const scaleY =
      photo.height() *
      photo.scaleY() /
      stage.height();


    const posX =
      photo.x() /
      stage.width() *
      downloadSize;

    const posY =
      photo.y() /
      stage.height() *
      downloadSize;


    ctx.drawImage(

      photo.getImage(),

      posX,
      posY,

      scaleX *
      downloadSize,

      scaleY *
      downloadSize

    );


    // =================================================
    // MOLDURA BRUNO + MÁRIO
    // =================================================

    if (
      frameBMImg &&
      frameBMImg.visible()
    ) {

      ctx.drawImage(

        frameBMImg.image(),

        0,
        0,

        downloadSize,
        downloadSize

      );

    }


    // =================================================
    // MOLDURA + KALIL
    // =================================================

    if (
      frameBMKImg &&
      frameBMKImg.visible()
    ) {

      ctx.drawImage(

        frameBMKImg.image(),

        0,
        0,

        downloadSize,
        downloadSize

      );

    }


    // =================================================
    // EXPORTAÇÃO
    // =================================================

    mergedCanvas.toBlob(

      async (blob) => {

        if (!blob) {

          showNotification(
            'Não foi possível gerar a foto. Tente novamente.',
            7000
          );

          return;

        }


        const fileName =
          'Bruno-Miranda-Mario-Heringer-foto-com-moldura.jpg';


        // =============================================
        // iPHONE / iPAD
        // =============================================

        if (isIOS()) {

          const file =
            new File(

              [blob],

              fileName,

              {
                type: 'image/jpeg'
              }

            );


          if (
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({
              files: [file]
            })
          ) {

            try {

              await navigator.share({

                files: [file],

                title:
                  'Foto com moldura Bruno Miranda e Mário Heringer',

                text:
                  'Minha foto com a moldura do Bruno Miranda e Mário Heringer!'

              });


              showNotification(

                'Foto pronta! Escolha "Salvar Imagem" no menu de compartilhamento.',

                10000

              );

              return;


            } catch (error) {

              if (
                error &&
                error.name ===
                'AbortError'
              ) {

                return;

              }

            }

          }


          // =========================================
          // FALLBACK SAFARI
          // =========================================

          const imageURL =
            URL.createObjectURL(
              blob
            );

          const newWindow =
            window.open(
              imageURL,
              '_blank'
            );


          if (newWindow) {

            showNotification(

              'Sua foto está pronta! Toque e segure a imagem e escolha "Salvar em Fotos".',

              12000

            );

          } else {

            window.location.href =
              imageURL;

          }


          setTimeout(
            () => {

              URL.revokeObjectURL(
                imageURL
              );

            },
            60000
          );

          return;

        }


        // =============================================
        // COMPUTADOR / ANDROID
        // =============================================

        const imageURL =
          URL.createObjectURL(
            blob
          );

        const a =
          document.createElement(
            'a'
          );

        a.href =
          imageURL;

        a.download =
          fileName;

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);


        setTimeout(
          () => {

            URL.revokeObjectURL(
              imageURL
            );

          },
          1000
        );


        showNotification(

          'Foto baixada com sucesso! Compartilhe com os amigos!',

          10000

        );

      },

      'image/jpeg',

      1.0

    );

  }
);


// =====================================================
// REDIMENSIONAMENTO RESPONSIVO
// =====================================================

window.addEventListener(
  'resize',
  () => {

    const newSize =
      canvasContainer.offsetWidth;

    stage.width(newSize);
    stage.height(newSize);


    if (frameBMImg) {

      frameBMImg.width(newSize);
      frameBMImg.height(newSize);

    }


    if (frameBMKImg) {

      frameBMKImg.width(newSize);
      frameBMKImg.height(newSize);

    }


    if (overlayLayer) {

      overlayLayer
        .getChildren()
        .forEach(img => {

          img.width(newSize);
          img.height(newSize);

        });

    }


    if (photo) {

      const scale =
        Math.max(

          newSize /
          photo.getImage().width,

          newSize /
          photo.getImage().height

        );


      photo.setAttrs({

        x:
          (
            newSize -
            photo.getImage().width *
            scale
          ) / 2,

        y:
          (
            newSize -
            photo.getImage().height *
            scale
          ) / 2,

        width:
          photo.getImage().width *
          scale,

        height:
          photo.getImage().height *
          scale,

        scaleX: 1,
        scaleY: 1

      });

    }


    if (sampleLayer) {

      sampleLayer
        .getChildren()
        .forEach(img => {

          img.width(newSize);
          img.height(newSize);

        });

    }


    overlayLayer.moveToTop();

    frameLayer.draw();
    photoLayer.draw();

  }
);


// =====================================================
// INICIALIZAR
// =====================================================

initCanvas();

"""
Integration of MNIST model
using Flask, Python/Numpy/OpenCV, HTML5, CSS/Bulma and JavaScript/jQuery
"""
from flask import Flask, request, send_from_directory, render_template
from werkzeug.utils import secure_filename
import numpy as np
import cv2

UPLOAD_FOLDER = 'upload/'
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif', 'bmp'])
APP = Flask(__name__)
APP.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    """allowed_file func"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@APP.route("/" + UPLOAD_FOLDER + '<filename>')
def uploaded_file(filename):
    """necessary to access uploaded pictures"""
    return send_from_directory(APP.config['UPLOAD_FOLDER'], filename)


@APP.route('/')
def form():
    """route to main frame"""
    return render_template('form.html')


@APP.route('/ajax_submit', methods=['POST'])
def ajax():
    """ajax response to canvas submit"""
    import base64
    import keras
    from keras.models import load_model
    from flask import jsonify

    img = request.values['img']
    content = img.split(';')[1]
    image_encoded = content.split(',')[1]
    image_string = base64.decodestring(image_encoded.encode('utf-8'))
    nparr = np.fromstring(image_string, np.uint8)
    img_cv2 = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    cv2.imwrite("image_cv2.jpg", img_cv2)
    img_cv2 = cv2.cvtColor(img_cv2, cv2.COLOR_RGB2GRAY)
    img_cv2 = cv2.resize(img_cv2, (28, 28))
    img_cv2 = img_cv2.reshape((1, img_cv2.shape[0], img_cv2.shape[1], 1))
    model = load_model('mnist_32x3x3_64x3x3P_128D_black_over_white.h5')
    model.compile(loss=keras.losses.categorical_crossentropy,
                  optimizer=keras.optimizers.Adam(),
                  metrics=['accuracy'])
    prediction = model.predict(img_cv2)
    predicted_class = np.argmax(prediction, axis=1)
    return jsonify(result='Guess is ' + str(predicted_class[0]))


@APP.route('/Guess', methods=['POST'])
def guess():
    """answer to file submit"""
    filename = ''
    error = ''
    predicted_class = ''
    debug = ''
    if request.method == 'POST':
        # check if the post request has the file part
        if 'img_sent' not in request.files:
            error = 'Aucun fichier envoyé'
        file = request.files['img_sent']
        # if user does not select file, browser also
        # submit a empty part without filename
        if file.filename == '':
            error = 'Nom du fichier vide'
        if file and allowed_file(file.filename):
            import keras
            from keras.models import load_model
            import numpy as np
            from skimage import io, transform

            filename = UPLOAD_FOLDER + secure_filename(file.filename)
            file.save(filename)

            img = io.imread(filename)
            arr = transform.resize(img, (img.shape[0], img.shape[1], 1),
                                   mode='constant', cval=0.0)
            arr = arr.reshape((1, img.shape[0], img.shape[1], 1))

            model = load_model('mnist_32x3x3_64x3x3P_128D_white_over_black.h5')
            model.compile(loss=keras.losses.categorical_crossentropy,
                          optimizer=keras.optimizers.Adam(),
                          metrics=['accuracy'])
            prediction = model.predict(arr)
            predicted_class = np.argmax(prediction, axis=1)[0]
    return render_template('answer.html', filename=filename, error=error,
                           predicted_class=predicted_class, debug=debug)

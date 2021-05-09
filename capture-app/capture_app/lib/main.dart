import 'dart:async';
import 'dart:developer';
import 'dart:io';
import 'dart:convert';

import 'package:camera/camera.dart';
import 'package:capture_app/login.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

String imageToBase64(File imageFile) {
  List<int> imageBytes = imageFile.readAsBytesSync();
  return base64Encode(imageBytes);
}

Future<void> main() async {
  // Ensure that plugin services are initialized so that `availableCameras()`
  // can be called before `runApp()`
  WidgetsFlutterBinding.ensureInitialized();

  // Obtain a list of the available cameras on the device.
  final cameras = await availableCameras();

  // Get a specific camera from the list of available cameras.
  final firstCamera = cameras.first;

  runApp(
    MaterialApp(
      theme: ThemeData.dark(),
      home: LoginPage(),
      // home: TakePictureScreen(
      //   // Pass the appropriate camera to the TakePictureScreen widget.
      //   camera: firstCamera,
      // ),
    ),
  );
}

// A screen that allows users to take a picture using a given camera.
class TakePictureScreen extends StatefulWidget {
  final CameraDescription camera;
  final String email;
  final String password;

  const TakePictureScreen({
    Key key,
    @required this.camera,
    @required this.email,
    @required this.password
  }) : super(key: key);

  @override
  TakePictureScreenState createState() => TakePictureScreenState();
}

class TakePictureScreenState extends State<TakePictureScreen> {
  CameraController _controller;
  Future<void> _initializeControllerFuture;

  @override
  void initState() {
    super.initState();
    // To display the current output from the Camera,
    // create a CameraController.
    _controller = CameraController(
      // Get a specific camera from the list of available cameras.
      widget.camera,
      // Define the resolution to use.
      ResolutionPreset.medium,
    );

    // Next, initialize the controller. This returns a Future.
    _initializeControllerFuture = _controller.initialize();
  }

  @override
  void dispose() {
    // Dispose of the controller when the widget is disposed.
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
        onWillPop: () {
          return new Future(() => false);
        },
        child: Scaffold(
          appBar: AppBar(
              title: Text('Take a picture'), automaticallyImplyLeading: false),
          // Wait until the controller is initialized before displaying the
          // camera preview. Use a FutureBuilder to display a loading spinner
          // until the controller has finished initializing.
          body: FutureBuilder<void>(
            future: _initializeControllerFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.done) {
                // If the Future is complete, display the preview.
                return CameraPreview(_controller);
              } else {
                // Otherwise, display a loading indicator.
                return Center(child: CircularProgressIndicator());
              }
            },
          ),
          floatingActionButton: FloatingActionButton(
            child: Icon(Icons.camera_alt),
            // Provide an onPressed callback.
            onPressed: () async {
              // Take the Picture in a try / catch block. If anything goes wrong,
              // catch the error.
              try {
                // Ensure that the camera is initialized.
                await _initializeControllerFuture;
                // Attempt to take a picture and get the file `image`
                // where it was saved.
                final image = await _controller.takePicture();
                // If the picture was taken, display it on a new screen.
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => DisplayPictureScreen(
                      // Pass the automatically generated path to
                      // the DisplayPictureScreen widget.
                      email: widget.email,
                      password: widget.password,
                      imagePath: image?.path,
                    ),
                  ),
                );
              } catch (e) {
                // If an error occurs, log the error to the console.
                print(e);
              }
            },
          ),
          floatingActionButtonLocation:
              FloatingActionButtonLocation.centerFloat,
        ));
  }
}

// A widget that displays the picture taken by the user.
class DisplayPictureScreen extends StatelessWidget {
  final String imagePath;
  final String email;
  final String password;

  const DisplayPictureScreen({Key key, this.imagePath, this.email, this.password}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Display the Picture')),
      // The image is stored as a file on the device. Use the `Image.file`
      // constructor with the given path to display the image.
      body: Image.file(File(imagePath)),
      floatingActionButton: FloatingActionButton(
        child: Icon(Icons.send),
        onPressed: () async {
          try {
            
            String base64Image = imageToBase64(File(imagePath));
            String email = this.email;
            String password = this.password;
            log(email);
            log(password);

            // Send the request containing the IMAGE
            http.post(
              Uri.https('google.com', ''),
              headers: <String, String>{
                'Content-Type': 'application/json; charset=UTF-8',
              },
              body: jsonEncode(<String, String> {
                'image': base64Image
              })
            );
            // Obtain a list of the available cameras on the device.
            final cameras = await availableCameras();

            // Get a specific camera from the list of available cameras.
            final firstCamera = cameras.first;
            // If the picture was sent, go back to taking picture screen.
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => TakePictureScreen(
                  // Pass the automatically generated path to
                  // the DisplayPictureScreen widget.
                  camera: firstCamera,
                  email: this.email,
                  password: this.password,
                ),
              ),
            );
          } catch (e) {
            // If an error occurs, log the error to the console.
            print(e);
          }
        },
      ),
    );
  }
}

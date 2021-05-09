import 'dart:async';
import 'dart:developer';
import 'dart:io';
import 'dart:convert';

import 'package:camera/camera.dart';
import 'package:capture_app/login.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:native_device_orientation/native_device_orientation.dart';

String imageToBase64(File imageFile) {
  List<int> imageBytes = imageFile.readAsBytesSync();
  return base64Encode(imageBytes);
}

// Future<NativeDeviceOrientation> deviceOrientation() async {
//   NativeDeviceOrientationCommunicator ndo;
//   var orientation = await ndo.orientation(useSensor: false);
//   // print(orientation);
//   return (orientation);
//   // setState(() {
//   //   someVal = result;
//   // })
// }

Future<void> main() async {
  // Ensure that plugin services are initialized so that `availableCameras()`
  // can be called before `runApp()`
  WidgetsFlutterBinding.ensureInitialized();

  // Obtain a list of the available cameras on the device.
  final cameras = await availableCameras();

  // Get a specific camera from the list of available cameras.
  final firstCamera = cameras.first;

  final loadedPrefs = await SharedPreferences.getInstance();
  final String email = loadedPrefs.getString('email');
  final String password = loadedPrefs.getString('password');

  // Try to log in automatically
  final response = await sendLoginRequest(email, password);
  // After the request is sent, we must wait for the response to validate the info and let us in
  final resBody = jsonDecode(response.body);
  bool loginFailed = false;

  if (resBody['token'] != null) {
    // Persistent login successful
    log(resBody['token']);
  } else {
    // Persistent login failed
    loginFailed = true;
  }

  // Ensure portraitUp orientation
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp])
      .then((_) {
    runApp(
      MaterialApp(
        theme: ThemeData.dark(),
        home: loginFailed
            ? LoginPage()
            : TakePictureScreen(
                camera: firstCamera, email: email, password: password),
        // home: TakePictureScreen(
        //   // Pass the appropriate camera to the TakePictureScreen widget.
        //   camera: firstCamera,
        // ),
      ),
    );
  });
  // runApp(
  //   MaterialApp(
  //     theme: ThemeData.dark(),
  //     home: loginFailed
  //         ? LoginPage()
  //         : TakePictureScreen(
  //             camera: firstCamera, email: email, password: password),
  //     // home: TakePictureScreen(
  //     //   // Pass the appropriate camera to the TakePictureScreen widget.
  //     //   camera: firstCamera,
  //     // ),
  //   ),
  // );
}

// A screen that allows users to take a picture using a given camera.
class TakePictureScreen extends StatefulWidget {
  final CameraDescription camera;
  final String email;
  final String password;

  const TakePictureScreen(
      {Key key,
      @required this.camera,
      @required this.email,
      @required this.password})
      : super(key: key);

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
              title: Row(
                children: [
                  Text('Take a picture'),
                  IconButton(
                    icon: Icon(Icons.logout),
                    onPressed: () async {
                      // Log out
                      // Reset stored credentials
                      final prefs = await SharedPreferences.getInstance();
                      prefs.setString('email', '');
                      prefs.setString('password', '');
                      if (Navigator.canPop(context)) {
                        Navigator.pop(context);
                      } else {
                        Navigator.pop(context);
                        Navigator.push(
                            context,
                            MaterialPageRoute(
                                builder: (context) => LoginPage()));
                      }
                    },
                  )
                ],
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
              ),
              automaticallyImplyLeading: false),

          // Wait until the controller is initialized before displaying the
          // camera preview. Use a FutureBuilder to display a loading spinner
          // until the controller has finished initializing.
          body: FutureBuilder<void>(
            future: _initializeControllerFuture,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.done) {
                // If the Future is complete, display the preview.
                // return CameraPreview(_controller);
                // NativeDeviceOrientationCommunicator ndo;
                // // var orientation = await ndo.orientation(useSensor: false);
                // Stream<NativeDeviceOrientation> orientation =
                //     ndo.onOrientationChanged(useSensor: false);

                // var orien = deviceOrientation();
                final orientation =
                    NativeDeviceOrientationReader.orientation(context);

                int turns;
                switch (orientation) {
                  case NativeDeviceOrientation.landscapeLeft:
                    turns = -1;
                    break;
                  case NativeDeviceOrientation.landscapeRight:
                    turns = 1;
                    break;
                  case NativeDeviceOrientation.portraitDown:
                    turns = 2;
                    break;
                  default:
                    turns = 0;
                    break;
                }
                return RotatedBox(
                    quarterTurns: turns, child: CameraPreview(_controller));

                // log("orientationListener broken");
                // return Container(width: 0, height: 0);
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

  const DisplayPictureScreen(
      {Key key, this.imagePath, this.email, this.password})
      : super(key: key);

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

            final prefs = await SharedPreferences.getInstance();
            // read data from token key. If it doesn't exist, return "no token found"
            final token = prefs.getString('token') ?? "No token found";

            log(email);
            log(password);
            log(token);

            // Send the request containing the IMAGE
            final response = await http.post(
                Uri.https('to-hacks2021.herokuapp.com', '/api/img'),
                headers: <String, String>{
                  'Content-Type': 'application/json; charset=UTF-8',
                  'x-auth-token': token,
                },
                body: jsonEncode(<String, String>{'image': base64Image}));

            log(response.body);

            // Obtain a list of the available cameras on the device.
            final cameras = await availableCameras();

            // Get a specific camera from the list of available cameras.
            final firstCamera = cameras.first;
            // If the picture was sent, go back to taking picture screen.
            Navigator.pop(context);
          } catch (e) {
            // If an error occurs, log the error to the console.
            print(e);
          }
        },
      ),
    );
  }
}

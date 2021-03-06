import logo from "./logo.svg";
import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import "./App.css";
import io from "socket.io-client";
import jwt_decode from "jwt-decode";

const host = "";
const socket = io(host);
const img_link = "https://source.unsplash.com/500x800";

function App() {
  const [loginValues, setLoginValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ username: null, password: null, server: null });
  const [registerValues, setRegisterValues] = useState({ email: "", password: "", password2: "" });
  const [loginForm, setLoginForm] = useState(true);
  const [validUser, setValidUser] = useState(false);
  const [user, setUser] = useState({ email: "", id: "" });
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [images, setImages] = useState([img_link]);
  const [texts, setTexts] = useState(["Start uploading images!"]);

  // Auth
  const checkToken = async (decoded) => {
    setValidUser(true);
    setLoginForm(false);
    setUser(decoded);
  };

  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["x-auth-token"] = token;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["x-auth-token"];
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    if (localStorage.token) {
      setAuthToken(localStorage.token);
      const decoded = jwt_decode(localStorage.token);
      checkToken(decoded);
      setUser(decoded.user);
      setValidUser(true);
    }
    setLoading(false);
    return () => {
      socket.off("disconnect");
    };
  }, []);

  // Socket

  function base64toBlob(base64Data, contentType) {
    contentType = contentType || "";
    var sliceSize = 1024;
    var byteCharacters = window.atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
      var begin = sliceIndex * sliceSize;
      var end = Math.min(begin + sliceSize, bytesLength);

      var bytes = new Array(end - begin);
      for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
        bytes[i] = byteCharacters[offset].charCodeAt(0);
      }
      byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
  }

  socket.once("imageFromServer", (data) => {
    if (data.image.split(",")[1] !== undefined) {
      data.image = data.image.split(",")[1];
    }
    let blob = base64toBlob(data.image, "image/png");
    let reader = new FileReader();
    reader.addEventListener("loadend", () => {
      let contents = reader.result;
      if (images[0] === img_link) {
        setImages([contents]);
        let text = data.text;
        setTexts([text]);
      } else {
        let text = data.text;
        setImages([contents, ...images]);
        setTexts([text, ...texts]);
      }
    });
    if (blob instanceof Blob) reader.readAsDataURL(blob);
  });
  if (validUser && !socketConnected) {
    console.log(user.id);
    socket.emit("connected", user.id);
    setSocketConnected(true);
  }

  // Inputs
  const onChange = (e) => {
    loginForm
      ? setLoginValues({ ...loginValues, [e.target.name]: e.target.value })
      : setRegisterValues({ ...registerValues, [e.target.name]: e.target.value });
  };

  const onDownload = () => {
    // unused for now
    // console.log("dl")
  };

  const onCopy = (e) => {
    try {
      const index = parseInt(e.target.id);
      let data = images[index];
      if (data.split(",")[1] !== undefined) {
        data = data.split(",")[1];
      }
      const { ClipboardItem } = window;
      navigator.clipboard.write([
        new ClipboardItem({
          "image/png": base64toBlob(data, "image/png"),
        }),
      ]);
    } catch (error) {
      console.error(error);
    }
  };
  const onCopyText = (e) => {
    try {
      const index = parseInt(e.target.id);
      let data = texts[index];

      navigator.clipboard.writeText(data);
    } catch (error) {
      console.error(error);
    }
  };

  const onLogout = (e) => {
    e.preventDefault();
    console.log("hey");
    setAuthToken(false);
    setLoginForm(true);
    setValidUser(false);
    setUser({ id: null, email: null });
    setSocketConnected(false);
    setImages([img_link]);
    setTexts(["Start uploading images!"]);
  };

  const onClear = () => {
    setImages([img_link]);
    setTexts(["Start uploading images!"]);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    axios
      .post(
        `${host}/api/${loginForm ? "auth" : "users"}`,
        loginForm
          ? {
              email: loginValues.email,
              password: loginValues.password,
            }
          : {
              email: registerValues.email,
              password: registerValues.password,
              password2: registerValues.password2,
            }
      )
      .then((res) => {
        if (loginForm) {
          setValidUser(true);
          setLoginForm(false);
          const token = res.data.token;
          setAuthToken(token);
          const decoded = jwt_decode(token);
          setUser(decoded);
          checkToken(decoded);
          setLoginValues({ email: "", password: "" });
        } else {
          setLoginForm(true);
          setRegisterValues({ email: "", password: "", password2: "" });
        }

        //do whatever you want here
      })
      .catch((err) => {
        setErrors(err.response.data.errors);
        console.log(errors);
        // display and handle errors here
      });
  };
  // if loading
  if (loading)
    return (
      <div>
        <div id="loading">
          <div class="obj"></div>
          <div class="obj"></div>
          <div class="obj"></div>
          <div class="obj"></div>
          <div class="obj"></div>
          <div class="obj"></div>
          <div class="obj"></div>
          <div class="obj"></div>
        </div>
        <div className="animation-area">
          <ul className="box-area">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div>
      </div>
    );

  // convert from base64 to blob
  return (
    <>
      <div>
        {loginForm ? (
          <div className="box">
            <a className="anchor" id="register"></a>
            <a className="anchor" id="login"></a>
            <form className="tab tab1 tab-default box-register" id="loginForm">
              <h2>Log in</h2>
              <span className="box-input">
                <input
                  className="input-element"
                  onChange={onChange}
                  value={loginValues.email}
                  name="email"
                  type="text"
                  placeholder="Email"
                  autocomplete="off"
                />
              </span>
              {<span className="error">{errors.email}</span>}
              <span className="box-input">
                <input
                  className="input-element"
                  type="password"
                  onChange={onChange}
                  value={loginValues.password}
                  placeholder="Password"
                  name="password"
                  autocomplete="off"
                />
              </span>
              {<span className="error">{errors.password}</span>}
              {<span className="error">{errors.auth}</span>}
              <button className="submit-button" type="submit" value="Log In" onClick={onSubmit}>
                Login
              </button>
              <a className="swap-button" href="#register" onClick={() => setLoginForm(!loginForm)}>
                Register instead
              </a>
            </form>
          </div>
        ) : !validUser ? (
          <div className="box">
            <form className="tab tab1 tab-default box-register">
              <h2>Register</h2>
              <span className="box-input">
                <input
                  className="input-element"
                  type="text"
                  name="email"
                  onChange={onChange}
                  value={registerValues.email}
                  placeholder="Email"
                  autocomplete="off"
                ></input>
              </span>
              {<span className="error">{errors.email}</span>}
              <span className="box-input">
                <input
                  className="input-element"
                  value={registerValues.password}
                  type="password"
                  name="password"
                  onChange={onChange}
                  placeholder="Password"
                  autocomplete="off"
                ></input>
              </span>
              {<span className="error">{errors.password}</span>}
              <span className="box-input">
                <input
                  className="input-element"
                  type="password"
                  onChange={onChange}
                  value={registerValues.password2}
                  name="password2"
                  placeholder="Confirm Password"
                  autocomplete="off"
                ></input>
              </span>
              {<span className="error">{errors.password2}</span>}
              <button className="submit-button" id="submitRegister" type="submit" onClick={onSubmit}>
                Register
              </button>
              <a className="swap-button" onClick={() => setLoginForm(!loginForm)}>
                Log In instead
              </a>
            </form>
          </div>
        ) : (
          <div class="dashboard">
            <ul class="outer-button">
              <li>
                <a href="#" onClick={onClear}>
                  Clear
                </a>
              </li>

              <li>
                <a href="#" onClick={onLogout}>
                  Log out
                </a>
              </li>
            </ul>
            <div class="content">
              <div class="header-info">
                <p>
                  Take an image on your mobile device, then wait for it here! <br />
                  If it isn't working, try reloading the page and then sending the image again.
                </p>
                <p>Auto-transcribed text will appear here!</p>
              </div>
              <div class="image-panel">
                {images.map((img, index) => (
                  <div className="container">
                    <div class="img-holder">
                      <img class="img" src={img} alt="" />
                      {img !== img_link ? (
                        <ul class="options">
                          <li>
                            <a href={img} target="_blank" download>
                              Download
                            </a>
                          </li>
                          <li>
                            <a href="#" id={index} onClick={onCopy}>
                              Copy to Clipboard
                            </a>
                          </li>
                        </ul>
                      ) : null}
                    </div>

                    <div class="image-textarea">
                      {texts[index]}
                      {img !== img_link ? (
                        <ul class="options">
                          <li>
                            <a href="#" id={index} onClick={onCopyText}>
                              Copy to Clipboard
                            </a>
                          </li>
                        </ul>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="animation-area">
        <ul className="box-area">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
    </>
  );
}

export default App;

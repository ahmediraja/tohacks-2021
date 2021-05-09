import logo from "./logo.svg";
import React, { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import "./App.css";
import io from "socket.io-client";
import jwt_decode from "jwt-decode";

const socket = io("http://localhost:5000/");

function App() {
  const [loginValues, setLoginValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ username: null, password: null, server: null });
  const [registerValues, setRegisterValues] = useState({ email: "", password: "", password2: "" });
  const [loginForm, setLoginForm] = useState(true);
  const [validUser, setValidUser] = useState(false);
  const [user, setUser] = useState({ email: "", id: "" });
  const [loading, setLoading] = useState(true);

  const checkToken = async (decoded) => {
    // await store.dispatch(setCurrentUser(decoded));
    // const currentTime = Date.now() / 1000;
    // if (decoded.exp < currentTime) {
    //   store.dispatch(logoutUser());
    //   store.dispatch(clearProfile());

    //   Router.push("/login");
    // }
    // store.dispatch({ type: LOADING_DONE });
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
      socket.emit("join", user.id);
    }
    setLoading(false);
    return () => {
      // socket.emit('disconnect')
      socket.off("disconnect");
    };
  }, []);

  const onChange = (e) => {
    loginForm
      ? setLoginValues({ ...loginValues, [e.target.name]: e.target.value })
      : setRegisterValues({ ...registerValues, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    axios
      .post(
        `http://localhost:5000/api/${loginForm ? "auth" : "users"}`,
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
        setValidUser(true);
        setLoginForm(false);
        const token = res.data.token;
        setAuthToken(token);
        const decoded = jwt_decode(token);
        setUser(decoded);
        //do whatever you want here
      })
      .catch((err) => {
        setErrors(err.response.data.errors);
        console.log(errors);
        // display and handle errors here
      });
  };
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
  return (
    <>
      <div>
        <div className="box">
          <a className="anchor" id="register"></a>
          <a className="anchor" id="login"></a>
          {loginForm ? (
            <form className="tab tab1 tab-default box-register" id="loginForm">
              <h2>Log in</h2>
              <span className="box-input">
                <input
                  className="input-element"
                  onChange={onChange}
                  value={loginValues.email}
                  name="email"
                  type="text"
                  placeholder="email"
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
                  placeholder="password"
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
          ) : !validUser ? (
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
          ) : (
            <div class="dashboard">
              <ul>
                <li>
                  <a href="#">Settings</a>
                </li>
                <li>
                  <a href="#">Log out</a>
                </li>
              </ul>
              <div class="content">
                <p>Take an image on your mobile device, then wait for it here!</p>
                <div class="img-holder">
                  <img src="https://source.unsplash.com/800x600" alt="" />
                </div>
                <ul class="options">
                  <li>
                    <a href="#">Download</a>
                  </li>
                  <li>
                    <a href="#">Copy to Clipboard</a>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
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

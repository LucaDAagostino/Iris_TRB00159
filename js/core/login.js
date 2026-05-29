/* Variabili globali come nel codice originale */
var userNameValidator = null;
var passwordValidator = null;

/* ============================ Login ============================ */

login = function () {
  resetFooter();
  loginTypeWebFacing();
  if (!Boolean(isSignon)) {
    loginTypeVirtualTerminal();
  }
  if (!Boolean(isSignon)) {
    loginTypeVirtualTerminalMoltiplyTech();
  }
  if (Boolean(isSignon)) {
    vantaAnimationAdd("#containerEmulatorInside");
  }
};

loginValidator = function (element, input, codeError) {
  if (codeError == "") {
    if ("rowUsername" === element.id) {
      userNameValidator = document.getElementById(input.id);
      if (userNameValidator && userNameValidator.value !== "") {
        isValid(userNameValidator, "iconUsername");
      } else {
        isError(userNameValidator, "iconUsername");
      }
    } else {
      passwordValidator = document.getElementById(input.id);
      if (passwordValidator && passwordValidator.value !== "") {
        isValid(passwordValidator, "iconPassword");
      } else {
        isError(passwordValidator, "iconPassword");
      }
    }
  } else {
    // Gestione errore.
    if (userNameValidator != null && passwordValidator != null) {
      userNameValidator = document.getElementById(userNameValidator.id);
      passwordValidator = document.getElementById(passwordValidator.id);
      if (codeError === "CPF1120") {
        isError(userNameValidator, "iconUsername");
        if (passwordValidator) passwordValidator.value = "";
      } else if (codeError === "CPF1107") {
        isError(passwordValidator, "iconPassword");
      }
    }
  }
  isValidButton();
};

isValidButton = function () {
  const loginButton = document.getElementById("loginButton");
  if (!loginButton) return;

  loginButton.classList.add("disabled");
  if (
    passwordValidator != null &&
    passwordValidator.value !== "" &&
    userNameValidator != null &&
    userNameValidator.value !== ""
  ) {
    loginButton.classList.remove("disabled");
  }
};

isValid = function (input, icon) {
  if (input) setBackground(input, "--bs-background-color-valid");
  setIconColor(icon, "--bs-background-color-valid");
};

isError = function (input, icon) {
  if (input) setBackground(input, "--bs-background-color-error");
  setIconColor(icon, "--bs-background-color-error");
};

/* ===================== Tipologia: Web Facing ===================== */

loginTypeWebFacing = function () {
  var div5250 = document.getElementById("5250");
  if (
    detectScreen(
      "D_1_23",
      "          Collegamento",
      "D_2_48",
      "Sistema . . . . . :",
      "D_3_48",
      "Sottosistema. . . :",
      "D_4_48",
      "Video . . . . . . :"
    )
  ) {
    isSignon = true;

    if (getObj("I_6_53") !== null) {
      changeElementClass("I_6_53", "loginInput form-control autoFillCustom");
      getObj("I_6_53").setAttribute("style", "");
      getObj("I_6_53").setAttribute("placeholder", "Username");
    }

    let loginDiv = createElement();
    loginDiv.id = "loginDiv";
    loginDiv.className = "loginDiv";
    div5250.appendChild(loginDiv);

    let rowUsername = createElement();
    rowUsername.id = "rowUsername";
    rowUsername.className = "row";

    let iconUsername = createElement("i");
    iconUsername.id = "iconUsername";
    iconUsername.className = "fas fa-user";

    rowUsername.appendChild(iconUsername);
    rowUsername.appendChild(getObj("I_6_53"));
    rowUsername.setAttribute("onkeyup", 'loginValidator(rowUsername,I_6_53,"")');

    loginDiv.appendChild(rowUsername);

    let rowPassword = createElement();
    rowPassword.id = "rowPassword";
    rowPassword.className = "row";

    let iconPassword = createElement("i");
    iconPassword.id = "iconPassword";
    iconPassword.className = "fa fa-lock";

    rowPassword.appendChild(iconPassword);

    let passwordFull = createElement("input");
    passwordFull.id = "passwordFull";
    passwordFull.className = "loginInput form-control autoFillCustom";
    passwordFull.name = "InputField1";
    passwordFull.type = "password";
    passwordFull.style = "";
    passwordFull.placeholder = "Password";
    passwordFull.autocomplete = "off";
    passwordFull.fieldInfo = {};
    passwordFull.maxLength = getObj("I_7_53").maxLength;

    if (getObj("I_8_1") != null) {
      passwordFull.maxLength = passwordFull.maxLength + getObj("I_8_1").maxLength;
    }
    if (getObj("I_9_1") != null) {
      passwordFull.maxLength = passwordFull.maxLength + getObj("I_9_1").maxLength;
    }

    rowPassword.setAttribute("onkeyup", 'loginValidator(rowPassword,passwordFull,"")');
    rowPassword.appendChild(passwordFull);

    let passwordToogle = createElement("i");
    passwordToogle.id = "passwordToogle";
    passwordToogle.className = "far fa-eye-slash";

    rowPassword.appendChild(passwordToogle);

    document.getElementById("passwordToogle").removeAttribute("style");

    passwordToogle.onclick = function () {
      let type = passwordFull.getAttribute("type") === "password" ? "text" : "password";
      passwordFull.setAttribute("type", type);

      if (type === "password") {
        passwordToogle.classList.remove("fa-eye");
        passwordToogle.classList.add("fa-eye-slash");
      } else {
        passwordToogle.classList.remove("fa-eye-slash");
        passwordToogle.classList.add("fa-eye");
      }
    };

    passwordFull.addEventListener("keyup", () => {
      const idPasswordFull = document.getElementById("passwordFull");
      if (idPasswordFull != null) {
        let positionFrom = 0;
        let positionTo = 0;
        positionTo = positionTo + getObj("I_7_53").maxLength;
        pui.set("I_7_53", idPasswordFull.value.slice(positionFrom, positionTo));
        if (getObj("I_8_1") != null) {
          positionFrom = positionTo++;
          positionTo = positionTo - 1 + getObj("I_8_1").maxLength;
          pui.set("I_8_1", idPasswordFull.value.slice(positionFrom, positionTo));
        }
        if (getObj("I_9_1") != null) {
          positionFrom = positionTo++;
          positionTo = positionTo - 1 + getObj("I_9_1").maxLength;
          pui.set("I_9_1", idPasswordFull.value.slice(positionFrom, positionTo));
        }
      }
    });

    loginDiv.appendChild(rowPassword);

    // Bottone Login
    var buttonsDiv = createElement();
    loginDiv.appendChild(buttonsDiv);

    var loginButton = createElement("button");
    loginButton.setAttribute("id", "loginButton");
    loginButton.setAttribute("value", "Login");
    loginButton.setAttribute("type", "button");
    loginButton.className = "btn btn-outline-light btn-lg loginButton";
    loginButton.setAttribute("style", "");
    loginButton.onclick = function () {
      pressKey("Enter");
    };
    buttonsDiv.appendChild(loginButton);

    let accessDiv = createElement();
    accessDiv.className = "accessWarning";
    loginDiv.appendChild(accessDiv);

    if (pui.genie.displaySize == 80) {
      if (getObj("D_24_1") != null) {
        getObj("D_24_1").setAttribute("style", "width: 100%; justify-content: center;");
        accessDiv.appendChild(getObj("D_24_1"));

        var error = document.getElementById("D_24_1");

        if (error.textContent.includes("CPF1107")) {
          loginValidator(document.getElementById("rowPassword"), document.getElementById("passwordFull"), "CPF1107");
        } else if (error.textContent.includes("CPF1120")) {
          loginValidator(document.getElementById("rowUsername"), document.getElementById("I_6_53"), "CPF1120");
        }
        passwordValidator = null;
        userNameValidator = null;
      }
    } else {
      if (getObj("D_27_1") != null) {
        getObj("D_27_1").setAttribute("style", "");
        accessDiv.appendChild(getObj("D_27_1"));
      }
    }
    if (pui.genie.displaySize == 80) {
      if (getObj("D_24_47") != null) {
        getObj("D_24_47").setAttribute("style", "");
        accessDiv.appendChild(getObj("D_24_47"));
      }
    } else {
      if (getObj("D_27_47") != null) {
        getObj("D_27_47").setAttribute("style", "");
        accessDiv.appendChild(getObj("D_27_47"));
      }
    }

    removeElements("D_1_23", "D_2_48", "D_2_70", "D_3_48", "D_3_70", "D_4_48", "D_4_70");
    removeElements("D_6_17", "D_7_17", "D_10_17", "D_11_17", "D_12_17", "D_24_40", "quit_button");
    hideElements("I_7_53", "I_8_1", "I_9_1", "I_10_53", "I_11_53", "I_12_53");
  } else {
    isSignon = false;
  }
};

/* ============ Tipologia: Virtual Terminal (standard) ============ */

loginTypeVirtualTerminal = function () {
  var div5250 = document.getElementById("5250");
  if (
    detectScreen(
      "D_6_35",
      "Collegamento",
      "D_6_53",
      "Sistema  . . . :",
      "D_7_53",
      "Sottosistema . :",
      "D_8_53",
      "Video  . . . . :"
    )
  ) {
    isSignon = true;
    if (getObj("D_11_4") === null) {
      if (getObj("I_10_48") !== null) {
        changeElementClass("I_10_48", "loginInput form-control autoFillCustom");
        getObj("I_10_48").setAttribute("style", "");
        getObj("I_10_48").setAttribute("placeholder", "Username");
      }
      if (getObj("I_11_48") !== null) {
        changeElementClass("I_11_48", "loginInput form-control autoFillCustom");
        getObj("I_11_48").setAttribute("style", "");
        getObj("I_11_48").setAttribute("placeholder", "Password");
      }
      if (getObj("D_3_17") !== null) {
        changeElementClass("D_3_17", "loginTitle");
        getObj("D_3_17").setAttribute("style", "");
      }

      let loginDiv = createElement();
      loginDiv.id = "loginDiv";
      loginDiv.className = "loginDiv";
      div5250.appendChild(loginDiv);

      if (Boolean(properties.showLoginTitle)) {
        loginDiv.appendChild(getObj("D_3_17"));
      } else {
        removeElements("D_3_17");
      }

      let rowUsername = createElement();
      rowUsername.id = "rowUsername";
      rowUsername.className = "row";

      let iconUsername = createElement("i");
      iconUsername.id = "iconUsername";
      iconUsername.className = "fas fa-user";

      rowUsername.appendChild(iconUsername);
      rowUsername.appendChild(getObj("I_10_48"));
      rowUsername.setAttribute("onkeyup", 'loginValidator(rowUsername,I_10_48,"")');
      loginDiv.appendChild(rowUsername);

      let rowPassword = createElement();
      rowPassword.id = "rowPassword";
      rowPassword.className = "row";

      let iconPassword = createElement("i");
      iconPassword.id = "iconPassword";
      iconPassword.className = "fa fa-lock";

      rowPassword.appendChild(iconPassword);
      rowPassword.appendChild(getObj("I_11_48"));
      rowPassword.setAttribute("onkeyup", 'loginValidator(rowPassword,I_11_48,"")');
      loginDiv.appendChild(rowPassword);

      let passwordToogle = createElement("i");
      passwordToogle.id = "passwordToogle";
      passwordToogle.className = "far fa-eye-slash";
      rowPassword.appendChild(passwordToogle);

      document.getElementById("passwordToogle").removeAttribute("style");

      passwordToogle.onclick = function () {
        let type = getObj("I_11_48").getAttribute("type") === "password" ? "text" : "password";
        getObj("I_11_48").setAttribute("type", type);

        if (type === "password") {
          passwordToogle.classList.remove("fa-eye");
          passwordToogle.classList.add("fa-eye-slash");
        } else {
          passwordToogle.classList.remove("fa-eye-slash");
          passwordToogle.classList.add("fa-eye");
        }
      };

      var buttonsDiv = createElement();
      loginDiv.appendChild(buttonsDiv);

      var loginButton = createElement("button");
      loginButton.setAttribute("id", "loginButton");
      loginButton.setAttribute("value", "Login");
      loginButton.setAttribute("type", "button");
      loginButton.className = "btn btn-outline-light btn-lg loginButton";
      loginButton.setAttribute("style", "");
      loginButton.onclick = function () {
        pressKey("Enter");
      };
      buttonsDiv.appendChild(loginButton);

      let accessDiv = createElement();
      accessDiv.className = "accessWarning";
      loginDiv.appendChild(accessDiv);

      if (pui.genie.displaySize == 80) {
        if (getObj("D_24_1") != null) {
          getObj("D_24_1").setAttribute("style", "width: 100%; justify-content: center;");
          accessDiv.appendChild(getObj("D_24_1"));

          var error = document.getElementById("D_24_1");

          if (error.textContent.includes("CPF1107")) {
            loginValidator(document.getElementById("rowPassword"), document.getElementById("I_11_48"), "CPF1107");
          } else if (error.textContent.includes("CPF1120")) {
            loginValidator(document.getElementById("rowUsername"), document.getElementById("I_10_48"), "CPF1120");
          }

          passwordValidator = null;
          userNameValidator = null;
        }
      } else {
        if (getObj("D_27_1") != null) {
          getObj("D_27_1").setAttribute("style", "");
          accessDiv.appendChild(getObj("D_27_1"));
        }
      }

      if (pui.genie.displaySize == 80) {
        if (getObj("D_24_47") != null) {
          getObj("D_24_47").setAttribute("style", "");
          accessDiv.appendChild(getObj("D_24_47"));
        }
      } else {
        if (getObj("D_27_47") != null) {
          getObj("D_27_47").setAttribute("style", "");
          accessDiv.appendChild(getObj("D_27_47"));
        }
      }

      removeElements("D_2_17", "D_4_17", "D_24_39");
      removeElements("D_6_35", "D_6_53", "D_6_70", "D_7_53", "D_7_70", "D_8_53", "D_8_70");
      removeElements("D_10_24", "D_11_24", "D_12_24", "D_13_24");
      removeElements(
        "D_15_2",
        "D_16_2",
        "D_17_2",
        "D_18_2",
        "D_19_2",
        "D_20_2",
        "D_21_2",
        "D_22_2",
        "D_23_2",
        "quit_button"
      );
      hideElements("I_12_48", "I_13_48");
    } else {
      let loginDiv = createElement();
      loginDiv.id = "loginDiv";
      loginDiv.className = "loginDiv loginWarning";
      div5250.appendChild(loginDiv);

      if (Boolean(showLoginTitle)) {
        if (getObj("D_3_17") !== null) {
          changeElementClass("D_3_17", "loginTitle");
          getObj("D_3_17").setAttribute("style", "");
          loginDiv.appendChild(getObj("D_3_17"));
        }
      }

      var accessInfo = createElement();
      accessInfo.classList = "accessInfo";
      var accessInfoP = createElement();
      accessInfoP.innerHTML =
        "Il vostro nome del terminale non rispetta gli standard per cui non vi sarà permesso effettuare il collegamento.<br/><br/>" +
        "Per assistenza inviare una mail all'indirizzo <a href='mailto:NetAdm@trebigen.it' target='blank'>NetAdm@trebigen.it</a>.";
      loginDiv.appendChild(accessInfo);
      accessInfo.appendChild(accessInfoP);

      let accessDiv = createElement();
      accessDiv.className = "accessWarning";
      loginDiv.appendChild(accessDiv);

      if (pui.genie.displaySize == 80) {
        getObj("D_24_1").setAttribute("style", "");
        getObj("D_24_47").setAttribute("style", "");
        accessDiv.appendChild(getObj("D_24_1"));
        accessDiv.appendChild(getObj("D_24_47"));
      } else {
        getObj("D_27_1").setAttribute("style", "");
        getObj("D_27_47").setAttribute("style", "");
        accessDiv.appendChild(getObj("D_27_1"));
        accessDiv.appendChild(getObj("D_27_47"));
      }
    }

    removeElements("D_2_17", "D_3_17", "D_4_17", "D_24_39");
    removeElements("D_6_35", "D_6_53", "D_6_70", "D_7_53", "D_7_70", "D_8_53", "D_8_70");
    hideElements("I_17_48", "I_18_48", "I_19_48", "I_20_48");
    removeElements(
      "D_10_2",
      "D_11_2",
      "D_11_4",
      "D_11_16",
      "D_11_79",
      "D_12_2",
      "D_12_15",
      "D_12_79",
      "D_13_2",
      "D_13_4",
      "D_13_37",
      "D_13_56",
      "D_13_79",
      "D_14_2",
      "D_14_4",
      "D_14_79",
      "D_15_2",
      "quit_button"
    );
    getObj("5250").style.display = "block";
  } else {
    isSignon = false;
  }
};

/* ======== Tipologia: Virtual Terminal (Moltiply Tech) ======== */

loginTypeVirtualTerminalMoltiplyTech = function () {
  var div5250 = document.getElementById("5250");
  if (
    detectScreen(
      "D_8_35",
      "Collegamento",
      "D_8_53",
      "Sistema. . . :",
      "D_9_53",
      "Sottosistema :",
      "D_10_53",
      "Video. . . . :"
    )
  ) {
    isSignon = true;
    if (getObj("D_11_4") === null) {
      if (getObj("I_12_48") !== null) {
        changeElementClass("I_12_48", "loginInput form-control autoFillCustom");
        getObj("I_12_48").setAttribute("style", "");
        getObj("I_12_48").setAttribute("placeholder", "Username");
      }
      if (getObj("I_13_48") !== null) {
        changeElementClass("I_13_48", "loginInput form-control autoFillCustom");
        getObj("I_13_48").setAttribute("style", "");
        getObj("I_13_48").setAttribute("placeholder", "Password");
      }

      let loginDiv = createElement();
      loginDiv.id = "loginDiv";
      loginDiv.className = "loginDiv";
      div5250.appendChild(loginDiv);

      let rowUsername = createElement();
      rowUsername.id = "rowUsername";
      rowUsername.className = "row";

      let iconUsername = createElement("i");
      iconUsername.id = "iconUsername";
      iconUsername.className = "fas fa-user";

      rowUsername.appendChild(iconUsername);
      rowUsername.appendChild(getObj("I_12_48"));
      rowUsername.setAttribute("onkeyup", 'loginValidator(rowUsername,I_12_48,"")');
      loginDiv.appendChild(rowUsername);

      let rowPassword = createElement();
      rowPassword.id = "rowPassword";
      rowPassword.className = "row";

      let iconPassword = createElement("i");
      iconPassword.id = "iconPassword";
      iconPassword.className = "fa fa-lock";

      rowPassword.appendChild(iconPassword);
      rowPassword.appendChild(getObj("I_13_48"));
      rowPassword.setAttribute("onkeyup", 'loginValidator(rowPassword,I_13_48,"")');
      loginDiv.appendChild(rowPassword);

      let passwordToogle = createElement("i");
      passwordToogle.id = "passwordToogle";
      passwordToogle.className = "far fa-eye-slash";
      rowPassword.appendChild(passwordToogle);

      document.getElementById("passwordToogle").removeAttribute("style");

      passwordToogle.onclick = function () {
        let type = getObj("I_13_48").getAttribute("type") === "password" ? "text" : "password";
        getObj("I_13_48").setAttribute("type", type);

        if (type === "password") {
          passwordToogle.classList.remove("fa-eye");
          passwordToogle.classList.add("fa-eye-slash");
        } else {
          passwordToogle.classList.remove("fa-eye-slash");
          passwordToogle.classList.add("fa-eye");
        }
      };

      var buttonsDiv = createElement();
      loginDiv.appendChild(buttonsDiv);

      var loginButton = createElement("input");
      loginButton.setAttribute("id", "loginButton");
      loginButton.setAttribute("value", "Login");
      loginButton.setAttribute("type", "button");
      loginButton.className = "btn btn-outline-light btn-lg loginButton";
      loginButton.setAttribute("style", "");
      loginButton.onclick = function () {
        pressKey("Enter");
      };
      buttonsDiv.appendChild(loginButton);

      let accessDiv = createElement();
      accessDiv.className = "accessWarning";
      loginDiv.appendChild(accessDiv);

      if (pui.genie.displaySize == 80) {
        if (getObj("D_24_1") != null) {
          getObj("D_24_1").setAttribute("style", "width: 100%; justify-content: center;");
          accessDiv.appendChild(getObj("D_24_1"));

          var error = document.getElementById("D_24_1");

          if (error.textContent.includes("CPF1107")) {
            loginValidator(document.getElementById("rowPassword"), document.getElementById("I_13_48"), "CPF1107");
          } else if (error.textContent.includes("CPF1120")) {
            loginValidator(document.getElementById("rowUsername"), document.getElementById("I_12_48"), "CPF1120");
          }
          passwordValidator = null;
          userNameValidator = null;
        }
      } else {
        if (getObj("D_27_1") != null) {
          getObj("D_27_1").setAttribute("style", "");
          accessDiv.appendChild(getObj("D_27_1"));
        }
      }
      if (pui.genie.displaySize == 80) {
        if (getObj("D_24_47") != null) {
          getObj("D_24_47").setAttribute("style", "");
          accessDiv.appendChild(getObj("D_24_47"));
        }
      } else {
        if (getObj("D_27_47") != null) {
          getObj("D_27_47").setAttribute("style", "");
          accessDiv.appendChild(getObj("D_27_47"));
        }
      }

      removeElements("D_2_17", "D_4_17", "D_24_39");
      removeElements("D_8_35", "D_8_53", "D_8_70", "D_9_53", "D_9_70", "D_10_53", "D_10_70");
      removeElements("D_12_24", "D_13_24", "D_14_24", "D_15_24");
      removeElements(
        "D_15_2",
        "D_16_2",
        "D_17_2",
        "D_18_2",
        "D_19_2",
        "D_20_2",
        "D_21_2",
        "D_22_2",
        "D_23_2",
        "quit_button"
      );
      hideElements("I_14_48", "I_15_48");
    } else {
      let loginDiv = createElement();
      loginDiv.id = "loginDiv";
      loginDiv.className = "loginDiv loginWarning";
      div5250.appendChild(loginDiv);

      if (Boolean(showLoginTitle)) {
        if (getObj("D_3_17") !== null) {
          changeElementClass("D_3_17", "loginTitle");
          getObj("D_3_17").setAttribute("style", "");
          loginDiv.appendChild(getObj("D_3_17"));
        }
      }

      var accessInfo = createElement();
      accessInfo.classList = "accessInfo";
      var accessInfoP = createElement();
      accessInfoP.innerHTML =
        "Il vostro nome del terminale non rispetta gli standard per cui non vi sarà permesso effettuare il collegamento.<br/><br/>" +
        "Per assistenza inviare una mail all'indirizzo <a href='mailto:NetAdm@trebigen.it' target='blank'>NetAdm@trebigen.it</a>.";
      loginDiv.appendChild(accessInfo);
      accessInfo.appendChild(accessInfoP);

      let accessDiv = createElement();
      accessDiv.className = "accessWarning";
      loginDiv.appendChild(accessDiv);

      if (pui.genie.displaySize == 80) {
        getObj("D_24_1").setAttribute("style", "");
        getObj("D_24_47").setAttribute("style", "");
        accessDiv.appendChild(getObj("D_24_1"));
        accessDiv.appendChild(getObj("D_24_47"));
      } else {
        getObj("D_27_1").setAttribute("style", "");
        getObj("D_27_47").setAttribute("style", "");
        accessDiv.appendChild(getObj("D_27_1"));
        accessDiv.appendChild(getObj("D_27_47"));
      }
    }

    removeElements("D_2_17", "D_3_17", "D_4_17", "D_6_1", "D_6_3", "D_24_39");
    removeElements("D_8_35", "D_8_53", "D_8_70", "D_9_53", "D_9_70", "D_10_53", "D_10_70");
    hideElements("I_17_48", "I_18_48", "I_19_48", "I_20_48");
    removeElements(
      "D_10_2",
      "D_11_2",
      "D_11_4",
      "D_11_16",
      "D_11_79",
      "D_12_2",
      "D_12_15",
      "D_12_79",
      "D_13_2",
      "D_13_4",
      "D_13_37",
      "D_13_56",
      "D_13_79",
      "D_14_2",
      "D_14_4",
      "D_14_79",
      "D_15_2",
      "quit_button"
    );
    getObj("5250").style.display = "block";
  } else {
    isSignon = false;
  }
};

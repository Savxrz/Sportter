import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/api";
import { actualizarContrasena } from "../services/api";
import { verificarEmail } from "../services/api";
import { registerUser } from "../services/api";

function PantallaInicio() {
  // Inicializar EmailJS
  useEffect(() => {
    emailjs.init("xKNXufG7xDCs3-jUh");
  }, []);

  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    verificationCode: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    verificationCode: "",
  });
  const [verificationSent, setVerificationSent] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [passwordResetStep, setPasswordResetStep] = useState(1); // 1: email, 2: code, 3: new password
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const location = useLocation();
  const [showPasswordResetFromState, setShowPasswordResetFromState] = useState(false);

  // Colores y gradientes
  const primaryGradient = "rgb(255, 77, 0)";
  const secondaryGradient = "linear-gradient(to right, grey, yellow)";
  const accentColor = "rgb(255, 77, 0)";
  const errorColor = "#e53e3e";
  const successColor = "#38a169";

  // Animaciones
  const formVariants = {
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  const verificationVariants = {
    hidden: {
      opacity: 0,
      x: 50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 },
  };

  // Verificar si el usuario ya está logueado
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "null");
    if (userData) {
      navigate("/principal", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (location.state?.showPasswordReset) {
      setForgotPassword(true);
      setPasswordResetStep(1);
      setFormData(prev => ({
        ...prev,
        email: location.state.email || ""
      }));
    }
  }, [location.state]);

  const isFormValid = () => {
    if (forgotPassword) {
      if (passwordResetStep === 1) {
        return formData.email.trim() && validateEmail(formData.email);
      } else if (passwordResetStep === 2) {
        return formData.verificationCode.trim();
      } else if (passwordResetStep === 3) {
        return (
          formData.password.trim() &&
          formData.passwordConfirm.trim() &&
          validatePassword(formData.password).valid &&
          formData.password === formData.passwordConfirm
        );
      }
    } else if (isLogin) {
      return formData.email.trim() && formData.password.trim();
    } else {
      if (!verificationSent) {
        return (
          formData.name.trim() &&
          formData.email.trim() &&
          formData.password.trim()
        );
      } else {
        return formData.verificationCode.trim();
      }
    }
  };

  const generateRandomCode = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const sendVerificationEmail = async (email, code) => {
    setIsSendingEmail(true);
    try {
      const templateParams = {
        email: email,
        codigo: code,
      };

      await emailjs.send("default_service", "template_260xda7", templateParams);

      setGeneratedCode(code);
      setIsSendingEmail(false);
      return true;
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      setErrors((prev) => ({
        ...prev,
        email: "Error al enviar el código. Intenta nuevamente.",
      }));
      setIsSendingEmail(false);
      return false;
    }
  };

  const sendWelcomeEmail = async (email, name) => {
    setIsSendingEmail(true);
    try {
      const templateParams = {
        email: email,
        name: name,
      };

      await emailjs.send("default_service", "template_byb5gbb", templateParams);

      console.log("Correo de bienvenida enviado");
      setIsSendingEmail(false);
      return true;
    } catch (error) {
      setIsSendingEmail(false);
      console.error("Error al enviar el correo de bienvenida:", error);
      return false;
    }
  };

  const sendPasswordResetEmail = async (email, code) => {
    setIsSendingEmail(true);
    try {
      const templateParams = {
        email: email,
        codigo: code,
      };

      await emailjs.send("default_service", "template_260xda7", templateParams);

      setGeneratedCode(code);
      setIsSendingEmail(false);
      return true;
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      setErrors((prev) => ({
        ...prev,
        email: "Error al enviar el código. Intenta nuevamente.",
      }));
      setIsSendingEmail(false);
      return false;
    }
  };

  const resendVerificationEmail = async () => {
    const newCode = generateRandomCode();
    const emailSent = await sendVerificationEmail(formData.email, newCode);

    if (emailSent) {
      setSuccessMessage(
        `Se ha reenviado el código de verificación a ${formData.email}`
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_\-+={}[\]:"';<>,.?\/\\|~`]/.test(
      password
    );
    const isLongEnough = password.length >= 8;

    return {
      valid:
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar &&
        isLongEnough,
      errors: {
        length: !isLongEnough ? "Mínimo 8 caracteres" : "",
        upper: !hasUpperCase ? "Al menos una mayúscula" : "",
        lower: !hasLowerCase ? "Al menos una minúscula" : "",
        number: !hasNumber ? "Al menos un número" : "",
        special: !hasSpecialChar ? "Al menos un caracter especial" : "",
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formIsValid = true;
    const newErrors = {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      verificationCode: "",
    };

    if (forgotPassword) {
      if (passwordResetStep === 1) {
        if (!validateEmail(formData.email)) {
          newErrors.email = "Correo electrónico no válido";
          formIsValid = false;
        }
        if (formIsValid) {
          if (passwordResetStep === 1) {
            if (!validateEmail(formData.email)) {
              newErrors.email = "Correo electrónico no válido";
              formIsValid = false;
            }

            if (formIsValid) {
              try {
                // Verificar si el email existe
                await verificarEmail(formData.email);
                setErrors({}); // limpiar errores si todo salió bien
                setEmailError("");

                // Si pasa la verificación, enviar el código
                const code = generateRandomCode();
                const emailSent = await sendPasswordResetEmail(
                  formData.email,
                  code
                );

                if (emailSent) {
                  setPasswordResetStep(2);
                  setSuccessMessage(
                    `Se ha enviado un código de verificación a ${formData.email}`
                  );
                }
              } catch (error) {
                setEmailError(error.message);
                setErrors((prev) => ({
                  ...prev,
                  email: error.message,
                }));
                // No continuar con el flujo si hay error
                return;
              }
            }
          }
        }
      } else if (passwordResetStep === 2) {
        if (!formData.verificationCode) {
          newErrors.verificationCode = "Código de verificación requerido";
          formIsValid = false;
        } else if (
          formData.verificationCode.toUpperCase() !==
          generatedCode.toUpperCase()
        ) {
          newErrors.verificationCode = "Código incorrecto";
          formIsValid = false;
        }

        if (formIsValid) {
          setPasswordResetStep(3);
          setSuccessMessage("Ahora puedes establecer tu nueva contraseña");
        }
      } else if (passwordResetStep === 3) {
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.valid) {
          newErrors.password = Object.values(passwordValidation.errors)
            .filter(Boolean)
            .join(", ");
          formIsValid = false;
        }

        if (formData.password !== formData.passwordConfirm) {
          newErrors.passwordConfirm = "Las contraseñas no coinciden";
          formIsValid = false;
        }

        if (formIsValid) {
          try {
            // Actualizar contraseña en el backend
            await actualizarContrasena(formData.email, formData.password);

            setPasswordResetSuccess(true);
            setSuccessMessage("¡Contraseña actualizada correctamente!");

            // Recargar la página después de 3 segundos
            setTimeout(() => {
              navigate("/", { replace: true });
              window.location.reload(); // Recarga completa de la página
            }, 2000);
          } catch (error) {
            setErrors((prev) => ({
              ...prev,
              general: error.message,
            }));
          }
        }
      }
    } else if (!isLogin && !verificationSent) {
      if (!formData.name.trim()) {
        newErrors.name = "El nombre es requerido";
        formIsValid = false;
      }

      if (!validateEmail(formData.email)) {
        newErrors.email = "Correo electrónico no válido";
        formIsValid = false;
      }

      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = Object.values(passwordValidation.errors)
          .filter(Boolean)
          .join(", ");
        formIsValid = false;
      }

      if (formIsValid) {
        try {
          console.log("Verificando si el email ya existe...");
          const emailExiste = await verificarEmail(formData.email, "registro");

          if (emailExiste) {
            setErrors({ email: "Este correo ya está registrado" });
            console.log("El correo ya está registrado");
            return;
          }

          const code = generateRandomCode();
          const emailSent = await sendVerificationEmail(formData.email, code);

          if (emailSent) {
            setVerificationSent(true);
            setSuccessMessage(`Código enviado a ${formData.email}`);
            setGeneratedCode(code);
          }
        } catch (error) {
          newErrors.general = "Error al verificar el correo electrónico";
        }
        return;
      }
    } else if (!isLogin && verificationSent && !formData.verificationCode) {
      newErrors.verificationCode = "Código de verificación requerido";
      formIsValid = false;
    } else if (isLogin) {
      if (!formData.email) {
        newErrors.email = "Correo electrónico requerido";
        formIsValid = false;
      }

      if (!formData.password) {
        newErrors.password = "Contraseña requerida";
        formIsValid = false;
      }
    }

    setErrors(newErrors);

    if (formIsValid && !forgotPassword) {
      if (!isLogin && !verificationSent) {
        const code = generateRandomCode();
        const emailSent = await sendVerificationEmail(formData.email, code);

        if (emailSent) {
          setVerificationSent(true);
          setSuccessMessage(
            `Se ha enviado un código de verificación a ${formData.email}`
          );
        }
      } else if (!isLogin && verificationSent) {
        if (
          formData.verificationCode.toUpperCase() ===
          generatedCode.toUpperCase()
        ) {
          try {
            // Llamada al servicio de registro
            const userData = await registerUser({
              nombreUsuario: formData.name,
              correoElectronico: formData.email,
              contrasena: formData.password,
            });

            await sendWelcomeEmail(formData.email, formData.name);
            setRegistrationSuccess(true);
            setSuccessMessage("¡Registro exitoso! Bienvenido a Sportter");
            setTimeout(() => {
              setIsLogin(true);
              setVerificationSent(false);
              setRegistrationSuccess(false);
              setFormData({
                name: "",
                email: "",
                password: "",
                passwordConfirm: "",
                verificationCode: "",
              });
              setShowPassword(false);
            }, 3000);
          } catch (error) {
            console.error("Error en el registro:", error);
            setErrors((prev) => ({
              ...prev,
              general: "Error al registrar el usuario. Inténtalo de nuevo.",
            }));
          }
        } else {
          setErrors((prev) => ({
            ...prev,
            verificationCode: "Código incorrecto",
          }));
        }
      } else {
        setErrors({
          email: "",
          password: "",
          general: "",
        });
        try {
          // Llamada al servicio de login
          const userData = await loginUser({
            correoElectronico: formData.email,
            contrasena: formData.password,
          });

          console.log("Inicio de sesión exitoso:", userData);

          // 1. Guardar datos de usuario en localStorage
          localStorage.setItem(
            "userData",
            JSON.stringify({
              ...userData,
              // Asegurar que los datos críticos estén presentes
              correoElectronico: formData.email,
              timestamp: new Date().getTime(), // Para manejar expiración
            })
          );

          // 2. Redirigir a la ruta solicitada originalmente o a /principal por defecto
          const redirectTo = location.state?.from?.pathname || "/principal";

          navigate(redirectTo, {
            state: {
              user: userData, // Envía todos los datos del usuario
            },
            replace: true, // Evita que el usuario vuelva al login con el botón "atrás"
          });
        } catch (error) {
          console.error("Error en el login:", error);

          // Limpiar errores previos
          setErrors({
            name: "",
            email: "",
            password: "",
            general: "",
          });

          // Manejar error específico de credenciales
          if (error.response && error.response.status === 401) {
            setErrors({
              email: "Correo electrónico o contraseña incorrectos",
              general: "Credenciales inválidas. Por favor, inténtalo de nuevo.",
            });
          }
          // Manejar otros errores de red/server
          else if (error.response) {
            setErrors({
              general: error.response.data.message || "Error del servidor",
            });
          }
          // Manejar errores de conexión
          else {
            setErrors({
              general:
                "Error de conexión. Verifica tu red e inténtalo de nuevo.",
            });
          }
        }
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const switchAuthMode = () => {
    setIsLogin(!isLogin);
    setVerificationSent(false);
    setErrors({
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      verificationCode: "",
    });
    setSuccessMessage("");
    setFormData({
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      verificationCode: "",
    });
    setShowPassword(false);
    setIsSendingEmail(false);
    setForgotPassword(false);
    setPasswordResetStep(1);
  };

  const handleForgotPassword = () => {
    setForgotPassword(true);
    setPasswordResetStep(1);
    setErrors({
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      verificationCode: "",
    });
    setSuccessMessage("");
    setFormData({
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      verificationCode: "",
    });
  };

  const handleBackToLogin = () => {
    setForgotPassword(false);
    setPasswordResetStep(1);
    setIsLogin(true);
    setErrors({
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      verificationCode: "",
    });
    setSuccessMessage("");
    setFormData({
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
      verificationCode: "",
    });
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{
        // backgroundImage: `url(${fondo})`,
        // backgroundSize: "cover",
        // backgroundPosition: "center",
        backgroundColor: "#000",
        height: "100vh",
        width: "100vw",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="card p-4"
        style={{
          width: "100%",
          maxWidth: "450px",
          overflow: "hidden",
          background: "transparent",
        }}
      >
        <AnimatePresence mode="wait">
          {registrationSuccess || passwordResetSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center p-4"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="mb-3"
              >
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"
                    fill={successColor}
                  />
                </svg>
              </motion.div>
              <h3 style={{ color: successColor }}>
                {passwordResetSuccess
                  ? "¡Contraseña actualizada!"
                  : "¡Registro exitoso!"}
              </h3>
              <p className="mt-2" style={{ color: "#4a5568" }}>
                {passwordResetSuccess
                  ? "Tu contraseña ha sido actualizada correctamente."
                  : "Bienvenido a Sportter"}
              </p>
              <p className="small" style={{ color: "#718096" }}>
                Redirigiendo a inicio de sesión...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={forgotPassword ? "forgot" : isLogin ? "login" : "register"}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ width: "100%" }}
              layout
              transition={{
                duration: 0.3,
                ease: "easeInOut",
                layout: {
                  duration: 0.4,
                  ease: "easeInOut",
                },
              }}
            >
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="alert mb-4"
                  style={{
                    background: "rgba(72, 187, 120, 0.1)",
                    borderLeft: `4px solid ${successColor}`,
                    color: "#2f855a",
                    borderRadius: "8px",
                    padding: "12px",
                  }}
                >
                  {successMessage}
                </motion.div>
              )}

              <motion.div variants={itemVariants} layout>
                <h2
                  className="text-center mb-4 fw-bold"
                  style={{
                    background: primaryGradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: "2rem",
                  }}
                >
                  {forgotPassword
                    ? passwordResetStep === 1
                      ? "Recuperar contraseña"
                      : passwordResetStep === 2
                      ? "Verificar código"
                      : "Nueva contraseña"
                    : isLogin
                    ? "Iniciar Sesión"
                    : verificationSent
                    ? "Verificar Código"
                    : "Registrarse"}
                </h2>
              </motion.div>

              <motion.form onSubmit={handleSubmit} layout>
                {forgotPassword ? (
                  <>
                    {passwordResetStep === 1 && (
                      <motion.div
                        variants={itemVariants}
                        className="mb-3"
                        layout
                        transition={{ duration: 0.2 }}
                      >
                        <label
                          className="form-label fw-medium"
                          style={{ color: "rgba(255, 255, 255, 0.7)" }}
                        >
                          Correo electrónico
                        </label>
                        <motion.input
                          whileFocus={{
                            borderBottom: `2px solid ${
                              errors.email ? errorColor : accentColor
                            }`,
                          }}
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-control py-2"
                          placeholder="tucorreo@email.com"
                          style={{
                            borderRadius: "1px",
                            border: "none",
                            borderBottom: `2px solid white`,
                            backgroundColor: "rgb(0, 0, 0)",
                            color: "white",
                            paddingLeft: "0px",
                            WebkitBoxShadow: "0 0 0 1000px rgba(0, 0, 0) inset",
                            WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
                            boxShadow: "0 0 0 1000px rgba(0, 0, 0) inset",
                            transition: "background-color 5000s ease-in-out 0s",
                          }}
                        />
                        {errors.email && (
                          <motion.small
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="d-block mt-1"
                            style={{ color: errorColor }}
                          >
                            {errors.email}
                          </motion.small>
                        )}
                      </motion.div>
                    )}

                    {passwordResetStep === 2 && (
                      <motion.div
                        key="verification"
                        variants={verificationVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="mb-3"
                        layout
                      >
                        <label
                          className="form-label fw-medium"
                          style={{ color: "rgba(255, 255, 255, 0.7)" }}
                        >
                          Código de verificación
                        </label>
                        <motion.input
                          whileFocus={{
                            borderBottom: `2px solid ${
                              errors.verificationCode ? errorColor : accentColor
                            }`,
                          }}
                          type="text"
                          name="verificationCode"
                          value={formData.verificationCode}
                          onChange={handleChange}
                          className="form-control py-2"
                          placeholder="Ingresa el código de 4 dígitos"
                          style={{
                            borderRadius: "1px",
                            border: "none",
                            borderBottom: `2px solid white`,
                            backgroundColor: "rgb(0, 0, 0)",
                            color: "white",
                            paddingLeft: "0px",
                            WebkitBoxShadow: "0 0 0 1000px rgba(0, 0, 0) inset",
                            WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
                            boxShadow: "0 0 0 1000px rgba(0, 0, 0) inset",
                            transition: "background-color 5000s ease-in-out 0s",
                          }}
                        />
                        {errors.verificationCode && (
                          <motion.small
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="d-block mt-1"
                            style={{ color: errorColor }}
                          >
                            {errors.verificationCode}
                          </motion.small>
                        )}
                        <motion.small
                          className="d-block mt-1"
                          style={{ color: "rgba(255, 255, 255, 0.55)" }}
                        >
                          Si no te ha llegado el correo{" "}
                          <motion.span
                            style={{
                              color: accentColor,
                              cursor: "pointer",
                              textDecoration: "underline",
                              fontWeight: "500",
                            }}
                            whileHover={{ color: "rgb(255, 255, 255)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resendVerificationEmail}
                          >
                            pincha aquí
                          </motion.span>{" "}
                          para reenviar otro código.
                        </motion.small>
                      </motion.div>
                    )}

                    {passwordResetStep === 3 && (
                      <>
                        <motion.div
                          variants={itemVariants}
                          className="mb-3"
                          layout
                        >
                          <label
                            className="form-label fw-medium"
                            style={{ color: "rgba(255, 255, 255, 0.7)" }}
                          >
                            Contraseña
                          </label>
                          <div style={{ position: "relative" }}>
                            <motion.input
                              whileFocus={{
                                borderBottom: `2px solid ${
                                  errors.password ? errorColor : accentColor
                                }`,
                              }}
                              type={showPassword ? "text" : "password"}
                              name="password"
                              value={formData.password}
                              onChange={handleChange}
                              className="form-control py-2"
                              placeholder="********"
                              style={{
                                borderRadius: "1px",
                                border: "none",
                                borderBottom: `2px solid white`,
                                backgroundColor: "rgb(0, 0, 0)",
                                color: "white",
                                paddingLeft: "0px",
                                WebkitBoxShadow:
                                  "0 0 0 1000px rgba(0, 0, 0) inset",
                                WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
                                boxShadow: "0 0 0 1000px rgba(0, 0, 0) inset",
                                transition:
                                  "background-color 5000s ease-in-out 0s",
                              }}
                            />
                            <button
                              type="button"
                              onClick={toggleShowPassword}
                              style={{
                                position: "absolute",
                                right: "10px",
                                top: "10px",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                color: "#718096",
                                padding: "0",
                                height: "20px",
                                width: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {showPassword ? (
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12 5C5.64 5 2 12 2 12C2 12 5.64 19 12 19C18.36 19 22 12 22 12C22 12 18.36 5 12 5ZM12 16.5C9.52 16.5 7.5 14.48 7.5 12C7.5 9.52 9.52 7.5 12 7.5C14.48 7.5 16.5 9.52 16.5 12C16.5 14.48 14.48 16.5 12 16.5Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M20.71 4.04L19.37 5.38L18.63 4.64L19.97 3.3C19.97 3.3 19.97 3.3 19.96 3.3L20.7 4.04C20.71 4.05 20.71 4.04 20.71 4.04Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M4.04 20.71L3.3 19.97C3.3 19.97 3.3 19.97 3.3 19.96L4.64 18.62L5.38 19.36L4.04 20.71Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M19.36 5.38L4.64 20.1L3.9 19.36L18.62 4.64L19.36 5.38Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M12 5C5.64 5 2 12 2 12C2 12 5.64 19 12 19C18.36 19 22 12 22 12C22 12 18.36 5 12 5ZM12 16.5C9.52 16.5 7.5 14.48 7.5 12C7.5 9.52 9.52 7.5 12 7.5C14.48 7.5 16.5 9.52 16.5 12C16.5 14.48 14.48 16.5 12 16.5Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                          {errors.password && (
                            <motion.small
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="d-block mt-1"
                              style={{ color: errorColor }}
                            >
                              {errors.password}
                            </motion.small>
                          )}
                          <motion.small
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            className="d-block mt-1"
                            style={{ color: "rgba(255, 255, 255, 0.7)" }}
                          >
                            La contraseña debe tener al menos 8 caracteres, una
                            mayúscula, una minúscula, un número y un caracter
                            especial.
                          </motion.small>
                        </motion.div>

                        <motion.div
                          variants={itemVariants}
                          className="mb-3"
                          layout
                        >
                          <label
                            className="form-label fw-medium"
                            style={{ color: "rgba(255, 255, 255, 0.7)" }}
                          >
                            Confirmar nueva contraseña
                          </label>
                          <motion.input
                            whileFocus={{
                              borderBottom: `2px solid ${
                                errors.passwordConfirm
                                  ? errorColor
                                  : accentColor
                              }`,
                            }}
                            type={showPassword ? "text" : "password"}
                            name="passwordConfirm"
                            value={formData.passwordConfirm}
                            onChange={handleChange}
                            className="form-control py-2"
                            placeholder="********"
                            style={{
                              borderRadius: "1px",
                              border: "none",
                              borderBottom: `2px solid white`,
                              backgroundColor: "rgb(0, 0, 0)",
                              color: "white",
                              paddingLeft: "0px",
                              WebkitBoxShadow:
                                "0 0 0 1000px rgba(0, 0, 0) inset",
                              WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
                              boxShadow: "0 0 0 1000px rgba(0, 0, 0) inset",
                              transition:
                                "background-color 5000s ease-in-out 0s",
                            }}
                          />
                          {errors.passwordConfirm && (
                            <motion.small
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="d-block mt-1"
                              style={{ color: errorColor }}
                            >
                              {errors.passwordConfirm}
                            </motion.small>
                          )}
                        </motion.div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {!isLogin && !verificationSent && (
                      <motion.div
                        variants={itemVariants}
                        className="mb-3"
                        layout
                        transition={{ duration: 0.2 }}
                      >
                        <label
                          className="form-label fw-medium"
                          style={{ color: "rgba(255, 255, 255, 0.7)" }}
                        >
                          Nombre
                        </label>
                        <motion.input
                          whileFocus={{
                            borderBottom: `2px solid ${
                              errors.name ? errorColor : accentColor
                            }`,
                          }}
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="form-control py-2"
                          placeholder="Tu nombre"
                          style={{
                            borderRadius: "1px",
                            border: "none",
                            borderBottom: `2px solid white`,
                            backgroundColor: "rgb(0, 0, 0)",
                            color: "white",
                            paddingLeft: "0px",
                            WebkitBoxShadow: "0 0 0 1000px rgba(0, 0, 0) inset",
                            WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
                            boxShadow: "0 0 0 1000px rgba(0, 0, 0) inset",
                            transition: "background-color 5000s ease-in-out 0s",
                          }}
                        />
                        {errors.name && (
                          <motion.small
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="d-block mt-1"
                            style={{ color: errorColor }}
                          >
                            {errors.name}
                          </motion.small>
                        )}
                      </motion.div>
                    )}

                    {(!verificationSent || isLogin) && (
                      <motion.div
                        variants={itemVariants}
                        className="mb-3"
                        layout
                      >
                        <label
                          className="form-label fw-medium"
                          style={{ color: "rgba(255, 255, 255, 0.7)" }}
                        >
                          Correo electrónico
                        </label>
                        <motion.input
                          whileFocus={{
                            borderBottom: `2px solid
                              ${errors.email ? errorColor : accentColor}`,
                          }}
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-control py-2"
                          placeholder="tucorreo@email.com"
                          style={{
                            borderRadius: "1px",
                            border: "none",
                            borderBottom: `2px solid white`,
                            backgroundColor: "rgb(0, 0, 0)",
                            color: "white",
                            paddingLeft: "0px",
                            WebkitBoxShadow: "0 0 0 1000px rgba(0, 0, 0) inset",
                            WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
                            boxShadow: "0 0 0 1000px rgba(0, 0, 0) inset",
                            transition: "background-color 5000s ease-in-out 0s",
                          }}
                        />
                        {errors.email && (
                          <motion.small
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="d-block mt-1"
                            style={{ color: errorColor }}
                          >
                            {errors.email}
                          </motion.small>
                        )}
                      </motion.div>
                    )}

                    {(!verificationSent || isLogin) && (
                      <motion.div
                        variants={itemVariants}
                        className="mb-3"
                        layout
                      >
                        <label
                          className="form-label fw-medium"
                          style={{ color: "rgba(255, 255, 255, 0.7)" }}
                        >
                          Contraseña
                        </label>
                        <div style={{ position: "relative" }}>
                          <motion.input
                            whileFocus={{
                              borderBottom: `2px solid ${
                                errors.password ? errorColor : accentColor
                              }`,
                            }}
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-control py-2"
                            placeholder="********"
                            style={{
                              borderRadius: "1px",
                              border: "none",
                              borderBottom: `2px solid white`,
                              backgroundColor: "rgb(0, 0, 0)",
                              color: "white",
                              paddingLeft: "0px",
                              WebkitBoxShadow:
                                "0 0 0 1000px rgba(0, 0, 0) inset",
                              WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
                              boxShadow: "0 0 0 1000px rgba(0, 0, 0) inset",
                              transition:
                                "background-color 5000s ease-in-out 0s",
                            }}
                          />
                          <button
                            type="button"
                            onClick={toggleShowPassword}
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "10px",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#718096",
                              padding: "0",
                              height: "20px",
                              width: "20px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {showPassword ? (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 5C5.64 5 2 12 2 12C2 12 5.64 19 12 19C18.36 19 22 12 22 12C22 12 18.36 5 12 5ZM12 16.5C9.52 16.5 7.5 14.48 7.5 12C7.5 9.52 9.52 7.5 12 7.5C14.48 7.5 16.5 9.52 16.5 12C16.5 14.48 14.48 16.5 12 16.5Z"
                                  fill="currentColor"
                                />
                                <path
                                  d="M12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                                  fill="currentColor"
                                />
                                <path
                                  d="M20.71 4.04L19.37 5.38L18.63 4.64L19.97 3.3C19.97 3.3 19.97 3.3 19.96 3.3L20.7 4.04C20.71 4.05 20.71 4.04 20.71 4.04Z"
                                  fill="currentColor"
                                />
                                <path
                                  d="M4.04 20.71L3.3 19.97C3.3 19.97 3.3 19.97 3.3 19.96L4.64 18.62L5.38 19.36L4.04 20.71Z"
                                  fill="currentColor"
                                />
                                <path
                                  d="M19.36 5.38L4.64 20.1L3.9 19.36L18.62 4.64L19.36 5.38Z"
                                  fill="currentColor"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 5C5.64 5 2 12 2 12C2 12 5.64 19 12 19C18.36 19 22 12 22 12C22 12 18.36 5 12 5ZM12 16.5C9.52 16.5 7.5 14.48 7.5 12C7.5 9.52 9.52 7.5 12 7.5C14.48 7.5 16.5 9.52 16.5 12C16.5 14.48 14.48 16.5 12 16.5Z"
                                  fill="currentColor"
                                />
                                <path
                                  d="M12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
                                  fill="currentColor"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <motion.small
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="d-block mt-1"
                            style={{ color: errorColor }}
                          >
                            {errors.password}
                          </motion.small>
                        )}
                        {!isLogin && !errors.password && !verificationSent && (
                          <motion.small
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            className="d-block mt-1"
                            style={{ color: "rgba(255, 255, 255, 0.75)" }}
                          >
                            La contraseña debe tener al menos 8 caracteres, una
                            mayúscula, una minúscula, un número y un caracter
                            especial.
                          </motion.small>
                        )}
                        {isLogin && !forgotPassword && (
                          <motion.div
                            className="text-end mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <motion.button
                              type="button"
                              onClick={handleForgotPassword}
                              className="btn btn-link p-0 fw-medium"
                              style={{
                                color: accentColor,
                                textDecoration: "none",
                                fontSize: "0.8rem",
                                textShadow: "none",
                              }}
                              whileHover={{
                                textDecoration: "underline",
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              ¿Olvidaste tu contraseña?
                            </motion.button>
                          </motion.div>
                        )}
                      </motion.div>
                    )}

                    <AnimatePresence>
                      {!isLogin && verificationSent && (
                        <motion.div
                          key="verification"
                          variants={verificationVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="mb-3"
                          layout
                        >
                          <label
                            className="form-label fw-medium"
                            style={{ color: "rgba(255, 255, 255, 0.7)" }}
                          >
                            Código de verificación
                          </label>
                          <motion.input
                            whileFocus={{
                              borderBottom: `2px solid ${
                                errors.verificationCode
                                  ? errorColor
                                  : accentColor
                              }`,
                            }}
                            type="text"
                            name="verificationCode"
                            value={formData.verificationCode}
                            onChange={handleChange}
                            className="form-control py-2"
                            placeholder="Ingresa el código de 4 dígitos"
                            style={{
                              borderRadius: "1px",
                              border: "none",
                              borderBottom: `2px solid white`,
                              backgroundColor: "rgb(0, 0, 0)",
                              color: "white",
                              paddingLeft: "0px",
                              WebkitBoxShadow:
                                "0 0 0 1000px rgba(0, 0, 0) inset",
                              WebkitTextFillColor: "rgba(255, 255, 255, 0.7)",
                              boxShadow: "0 0 0 1000px rgba(0, 0, 0) inset",
                              transition:
                                "background-color 5000s ease-in-out 0s",
                            }}
                          />
                          {errors.verificationCode && (
                            <motion.small
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="d-block mt-1"
                              style={{ color: errorColor }}
                            >
                              {errors.verificationCode}
                            </motion.small>
                          )}
                          <motion.small
                            className="d-block mt-1"
                            style={{ color: "#718096" }}
                          >
                            Si no te ha llegado el correo{" "}
                            <motion.span
                              style={{
                                color: accentColor,
                                cursor: "pointer",
                                textDecoration: "underline",
                                fontWeight: "500",
                              }}
                              whileHover={{ color: "#764ba2" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={resendVerificationEmail}
                            >
                              pincha aquí
                            </motion.span>{" "}
                            para reenviar otro código.
                          </motion.small>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                <motion.div variants={itemVariants} className="mt-4" layout>
                  <motion.button
                    whileHover={{
                      scale: isFormValid() ? 1.02 : 1,
                      boxShadow: isFormValid()
                        ? `0 4px 10px rgba(255, 68, 0, 0.78)`
                        : "none",
                    }}
                    whileTap={{ scale: isFormValid() ? 0.98 : 1 }}
                    type="submit"
                    className="btn w-100 py-2 fw-bold"
                    style={{
                      background: isFormValid()
                        ? primaryGradient
                        : "rgba(255, 77, 0, 0.5)",
                      color: "white",
                      borderRadius: "10px",
                      border: "none",
                      fontSize: "1.1rem",
                      cursor: isFormValid() ? "pointer" : "not-allowed",
                    }}
                    disabled={!isFormValid() || isSendingEmail}
                  >
                    {isSendingEmail
                      ? "Enviando..."
                      : forgotPassword
                      ? passwordResetStep === 1
                        ? "Enviar código"
                        : passwordResetStep === 2
                        ? "Verificar código"
                        : "Cambiar contraseña"
                      : isLogin
                      ? "Entrar"
                      : verificationSent
                      ? "Verificar"
                      : "Registrarse"}
                  </motion.button>
                </motion.div>
              </motion.form>

              <motion.div
                variants={itemVariants}
                className="text-center mt-4"
                layout
              >
                {forgotPassword ? (
                  <small className="text-muted d-flex align-items-center justify-content-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-link p-0 fw-bold"
                      onClick={handleBackToLogin}
                      style={{
                        color: accentColor,
                        textDecoration: "none",
                        lineHeight: "1.2",
                      }}
                    >
                      Volver a inicio de sesión
                    </motion.button>
                  </small>
                ) : (
                  <small
                    className="d-flex align-items-center justify-content-center"
                    style={{ color: "rgba(255, 255, 255, 0.7)" }}
                  >
                    {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-link p-0 fw-bold ms-1"
                      onClick={switchAuthMode}
                      style={{
                        color: accentColor,
                        textDecoration: "none",
                        lineHeight: "1.2",
                      }}
                    >
                      {isLogin ? "Regístrate" : "Inicia sesión"}
                    </motion.button>
                  </small>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default PantallaInicio;

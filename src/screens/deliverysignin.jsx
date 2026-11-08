import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebase-config";
import axios from "axios";

const USER_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";

function Deliverysignin() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const allUser = async () => {
    try {
      const response = await axios.get(USER_URL);
      setUsers(response.data);
    } catch (error) {
      console.error("Ошибка загрузки пользователей:", error);
    }
  };

  const getUserByUid = async (uid) => {
    const response = await axios.get(USER_URL);

    return response.data.find((item) => String(item.uid) === String(uid));
  };

  const createUser = async (userData) => {
    const response = await axios.post(USER_URL, userData);

    return response.data;
  };

  // статус
  const checkStatus = (user) => {
    if (user.status === "Новый") {
      navigate("/deliveryinfo");
    } else if (user.status === "Ожидание") {
      navigate("/deliverycheck");
    } else if (user.status === "Подтвержденный") {
      navigate("/deliveryprofile");
    } else {
      alert("Неизвестный статус курьера: " + user.status);
    }
  };

  // Вход через Google
  const loginWithGoogle = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      console.log("Google UID:", googleUser.uid);

      let existingUser = await getUserByUid(googleUser.uid);

      if (!existingUser) {
        const nameParts = (googleUser.displayName || "").split(" ");

        existingUser = await createUser({
          uid: googleUser.uid,
          firstname: nameParts[0] || "",
          lastname: nameParts.slice(1).join(" "),
          email: googleUser.email || "",
          avatar: googleUser.photoURL || "",
          numberphone: googleUser.phoneNumber || "",
          role: "courier",
          status: "Новый",
          balance: "0",
          adres: "Адреса нет",
          createdAt: new Date().toISOString(),
        });
      }

      console.log("Пользователь MockAPI:", existingUser);

      if (existingUser.role !== "courier") {
        alert("Этот аккаунт не является аккаунтом курьера");
        return;
      }

      localStorage.setItem("uid", googleUser.uid);

      alert("Вы успешно вошли через Google");

      checkStatus(existingUser);
    } catch (error) {
      console.error("Ошибка входа через Google:", error);

      alert(
        "Ошибка входа: " +
          (error.code || error.message || "Неизвестная ошибка"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    allUser();
  }, []);

  // Проверка сохранённого пользователя
  useEffect(() => {
    const checkSavedUser = async () => {
      let uid = localStorage.getItem("uid");

      if (uid) {
        try {
          uid = JSON.parse(uid);
        } catch (error) {}

        try {
          const user = await getUserByUid(uid);

          if (user && user.role === "courier") {
            checkStatus(user);
          }
        } catch (error) {
          console.error("Ошибка проверки пользователя:", error);
        }
      }
    };

    checkSavedUser();
  }, []);

  return (
    <div className="admin-signup-page">
      {/* 1 часть */}
      <div className="admin-signup-left">
        <div className="admin-signup-logo">
          MarketGo<span>.</span>
        </div>

        <div className="admin-signup-left-content">
          <p className="admin-signup-small">Курьер</p>

          <h1>
            Вход в
            <br />
            аккаунт курьера
          </h1>

          <p className="admin-signup-left-text">
            Входите в аккаунт или <b>Зарегистрируйтесь</b> пользователя, чтобы
            покупать товары и оформлять заказы в одном месте.
          </p>
        </div>

        <div className="admin-signup-left-bottom">MarketGo — ВАШ МАГАЗИН</div>
      </div>

      {/* 2 часть */}
      <div className="admin-signup-right">
        <div className="admin-signup-form-container">
          <p className="admin-signup-form-small">ДОБРО ПОЖАЛОВАТЬ</p>

          <h2>Вход в аккаунт или Зарегистрируйтесь</h2>

          <p className="admin-signup-form-description">Через Google</p>

          <div className="admin-signup-form">
            <button
              type="button"
              className="admin-signup-button"
              onClick={loginWithGoogle}
              disabled={loading}
            >
              <div className="google-logo" style={{ fontSize: "20px" }}>
                <span className="g-first">G</span>
                <span className="o-first">o</span>
                <span className="o-second">o</span>
                <span className="g-second">g</span>
                <span className="l-letter">l</span>
                <span className="e-letter">e</span>
              </div>
              <span>{loading ? "..." : "→"}</span>
            </button>
          </div>

          <p className="admin-signup-bottom-text">MarketGO</p>
        </div>
      </div>
    </div>
  );
}

export default Deliverysignin;

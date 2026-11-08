import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const USER_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";

function Deliveryinfo() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [adres, setAdres] = useState("");
  const [transport, setTransport] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        let uid = localStorage.getItem("uid");

        if (!uid) {
          alert("Сначала войдите в аккаунт");
          navigate("/deliverysignin");
          return;
        }

        try {
          uid = JSON.parse(uid);
        } catch (error) {}

        const response = await axios.get(USER_URL);

        const currentUser = response.data.find(
          (item) => String(item.uid) === String(uid),
        );

        if (!currentUser || currentUser.role !== "courier") {
          alert("Курьер не найден");
          navigate("/deliverysignin");
          return;
        }

        // Проверка статуса курьера
        if (currentUser.status === "Ожидание") {
          navigate("/deliverycheck");
          return;
        }

        if (currentUser.status === "Подтвержденный") {
          navigate("/deliveryprofile");
          return;
        }

        setUser(currentUser);
        setName(currentUser.firstname || "");
        setSurname(currentUser.lastname || "");
        setPhone(currentUser.numberphone || "");
        setAdres(currentUser.adres || "");
        setTransport(currentUser.transport || "");
      } catch (error) {
        console.error("Ошибка загрузки курьера:", error);
        alert("Не удалось загрузить данные");
      }
    };

    getUser();
  }, [navigate]);

  const sendInfo = async () => {
    if (
      !name.trim() ||
      !surname.trim() ||
      !phone.trim() ||
      !adres.trim() ||
      !transport
    ) {
      alert("Заполните все поля");
      return;
    }

    if (!user) {
      alert("Пользователь не найден");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(`${USER_URL}/${user.id}`, {
        ...user,
        firstname: name.trim(),
        lastname: surname.trim(),
        numberphone: phone.trim(),
        adres: adres.trim(),
        transport: transport,
        status: "Ожидание",
      });

      setUser(response.data);

      alert("Данные отправлены на проверку!");
      navigate("/deliverycheck");
    } catch (error) {
      console.error("Ошибка обновления курьера:", error);
      alert("Не удалось отправить данные");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-left">
          <p className="checkout-small-title">MarketGo / Данные об курьере</p>
          <div className="admin-signup-logo">
            MarketGo<span>.</span>
          </div>
          <h1>
            ДАННЫЕ
            <br />
            заказа
          </h1>

          <p className="checkout-description">
            Остался последний шаг! Заполните данные что-бы начать работу
          </p>

          <div className="checkout-decoration">ВАШ СТИЛЬ. ВАШ ВЫБОР.</div>
        </div>

        <div className="checkout-right">
          <div className="checkout-form">
            <p className="checkout-form-label">ДАННЫЕ</p>

            <h2>ДАННЫЕ ДЛЯ РАБОТУ</h2>

            <p className="checkout-form-description">
              Укажите свои контактные данные.
            </p>

            <div className="checkout-name-row">
              <div className="checkout-field">
                <label>Имя</label>
                <input
                  type="text"
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="checkout-field">
                <label>Фамилия</label>
                <input
                  type="text"
                  placeholder="Ваша фамилия"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                />
              </div>
            </div>

            <div className="checkout-field">
              <label>Номер телефона</label>
              <input
                type="tel"
                placeholder="+996 XXX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="checkout-field">
              <label>Адрес проживания</label>
              <input
                type="text"
                placeholder="Город, улица, дом, квартира"
                value={adres}
                onChange={(e) => setAdres(e.target.value)}
              />
            </div>

            <div className="checkout-field">
              <label>Транспорт</label>
              <select
                value={transport}
                onChange={(e) => setTransport(e.target.value)}
              >
                <option value="">Выберите категорию транспортов</option>
                <option value="Машина">Машина</option>
                <option value="Мотоцикл">Мотоцикл</option>
                <option value="Скутер">Скутер</option>
                <option value="Велосипед">Велосипед</option>
                <option value="Пешком">Пешком</option>
              </select>
            </div>

            <button
              className="checkout-button"
              onClick={sendInfo}
              disabled={loading}
            >
              {loading ? "Отправка..." : "Отправить на проверку"} <span>→</span>
            </button>
          </div>

          <p className="checkout-footer">STYLESTORE © 2026</p>
        </div>
      </div>
    </div>
  );
}

export default Deliveryinfo;

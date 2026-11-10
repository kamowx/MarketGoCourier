import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DeliveryBottomnav from "../components/DeliveryBottomnav";

const USER_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";

function Deliveryprofile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const uid = localStorage.getItem("uid")?.replaceAll('"', "");

        if (!uid) {
          navigate("/deliverysignin");
          return;
        }

        const res = await axios.get(USER_URL);

        const currentUser = res.data.find(
          (item) => String(item.uid) === String(uid),
        );

        if (!currentUser || currentUser.role !== "courier") {
          navigate("/deliverysignin");
          return;
        }

        // Проверяем статус курьера
        if (currentUser.status === "Новый") {
          navigate("/deliveryinfo");
          return;
        }

        if (currentUser.status === "Ожидание") {
          navigate("/deliverycheck");
          return;
        }

        if (currentUser.status !== "Подтвержденный") {
          navigate("/deliverysignin");
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.log("Ошибка загрузки профиля:", error);
        alert("Не удалось загрузить профиль");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  // Выход из аккаунта
  const logout = () => {
    localStorage.removeItem("uid");
    navigate("/deliverysignin");
  };

  if (loading) {
    return <div className="delivery-profile-loading">Загрузка профиля...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="delivery-profile">
      {/* Шапка */}

      <header className="delivery-profile-header">
        <Link to="/" className="delivery-profile-back">
          <i className="fa-solid fa-arrow-left"></i>
        </Link>

        <h2>
          Market<span>Go</span>
        </h2>

        <div className="delivery-profile-header-empty"></div>
      </header>

      {/* Контент */}

      <main className="delivery-profile-content">
        {/* Пользователь */}

        <div className="delivery-profile-user">
          <div className="delivery-profile-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt="Аватар курьера" />
            ) : (
              <i className="fa-solid fa-user"></i>
            )}
          </div>

          <h1>Мой профиль</h1>
          <p>Личный кабинет курьера</p>

          <div className="delivery-profile-status">
            <i className="fa-solid fa-circle-check"></i>
            Подтверждённый курьер
          </div>
        </div>

        {/* Карточка данных */}

        <div className="delivery-profile-card">
          <div className="delivery-profile-row">
            <div className="delivery-profile-icon">
              <i className="fa-solid fa-user"></i>
            </div>

            <div>
              <span>Имя и фамилия</span>
              <strong>
                {user.firstname || "Не указано"} {user.lastname || ""}
              </strong>
            </div>
          </div>

          <div className="delivery-profile-row">
            <div className="delivery-profile-icon">
              <i className="fa-solid fa-envelope"></i>
            </div>

            <div>
              <span>Email</span>
              <strong>{user.email || "Не указан"}</strong>
            </div>
          </div>

          <div className="delivery-profile-row">
            <div className="delivery-profile-icon">
              <i className="fa-solid fa-phone"></i>
            </div>

            <div>
              <span>Номер телефона</span>
              <strong>{user.numberphone || "Не указан"}</strong>
            </div>
          </div>

          <div className="delivery-profile-row">
            <div className="delivery-profile-icon">
              <i className="fa-solid fa-price"></i>
            </div>

            <div>
              <span>Номер телефона</span>
              <strong>{user.balance || "Не указан"}</strong>
            </div>
          </div>
        </div>

        {/* Разделы */}

        <div className="delivery-profile-actions">
          <div className="delivery-profile-action">
            <div className="delivery-action-icon">
              <i className="fa-solid fa-box"></i>
            </div>

            <div>
              <strong>Мои доставки</strong>
              <span>Ваши заказы на доставку</span>
            </div>

            <i className="fa-solid fa-chevron-right"></i>
          </div>

          <div className="delivery-profile-action">
            <div className="delivery-action-icon">
              <i className="fa-solid fa-truck-fast"></i>
            </div>

            <div>
              <strong>Мой транспорт</strong>
              <span>{user.transport || "Не указан"}</span>
            </div>

            <i className="fa-solid fa-chevron-right"></i>
          </div>

          <div className="delivery-profile-action">
            <div className="delivery-action-icon">
              <i className="fa-solid fa-location-dot"></i>
            </div>

            <div>
              <strong>Адрес проживания</strong>
              <span>{user.adres || "Не указан"}</span>
            </div>

            <i className="fa-solid fa-chevron-right"></i>
          </div>

          <div className="delivery-profile-action">
            <div className="delivery-action-icon">
              <i className="fa-solid fa-shield-halved"></i>
            </div>

            <div>
              <strong>Статус аккаунта</strong>
              <span>{user.status}</span>
            </div>

            <i className="fa-solid fa-chevron-right"></i>
          </div>
        </div>

        {/* Кнопки */}

        <div className="delivery-profile-buttons">
          <Link to="/deliveryinfo" className="delivery-profile-edit">
            <i className="fa-solid fa-pen"></i>
            Изменить данные
          </Link>

          <button className="delivery-profile-logout" onClick={logout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            Выйти из аккаунта
          </button>
        </div>

        {/* Подвал */}

        <div className="delivery-profile-footer">MARKETGO DELIVERY</div>
      </main>
      <DeliveryBottomnav />
    </div>
  );
}

export default Deliveryprofile;

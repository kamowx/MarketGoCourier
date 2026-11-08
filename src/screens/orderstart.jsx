import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const USERS_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";

function Orderstart() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const getOrder = async () => {
    try {
      const uid = localStorage.getItem("uid")?.replaceAll('"', "");

      if (!uid) {
        navigate("/deliverysignin");
        return;
      }

      const usersResponse = await axios.get(USERS_URL);

      const courier = usersResponse.data.find(
        (item) => String(item.uid) === String(uid) && item.role === "courier",
      );

      if (!courier) {
        alert("Курьер не найден");
        navigate("/deliverysignin");
        return;
      }

      const orderResponse = await axios.get(`${ORDERS_URL}/${id}`);
      const currentOrder = orderResponse.data;

      if (String(currentOrder.deliveryId) !== String(courier.id)) {
        alert("Этот заказ не принадлежит вам");
        navigate("/deliveryorders");
        return;
      }

      setOrder(currentOrder);
    } catch (error) {
      console.log("Ошибка загрузки заказа:", error);
      alert("Не удалось загрузить заказ");
      navigate("/deliveryorders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrder();
  }, [id]);

  // Изменение статуса заказа
  const changeStatus = async (newStatus) => {
    try {
      setUpdating(true);

      const response = await axios.get(`${ORDERS_URL}/${id}`);

      await axios.put(`${ORDERS_URL}/${id}`, {
        ...response.data,
        orderstatus: newStatus,
      });

      setOrder({
        ...response.data,
        orderstatus: newStatus,
      });

      alert("Статус заказа изменён!");
    } catch (error) {
      console.log("Ошибка изменения статуса:", error);
      alert("Не удалось изменить статус");
    } finally {
      setUpdating(false);
    }
  };

  // Кнопка в зависимости от статуса
  const getButton = () => {
    if (order.orderstatus === "Едет") {
      return (
        <button
          className="orderstart-main-button"
          onClick={() => changeStatus("Получить")}
          disabled={updating}
        >
          <i className="fa-solid fa-box"></i>
          Получить
        </button>
      );
    }

    if (order.orderstatus === "Получить") {
      return (
        <div className="orderstart-waiting">
          <i className="fa-solid fa-clock"></i>
          Ожидайте, пока продавец передаст заказ
        </div>
      );
    }

    if (order.orderstatus === "Передано") {
      return (
        <button
          className="orderstart-main-button"
          onClick={() => changeStatus("На дороге")}
          disabled={updating}
        >
          <i className="fa-solid fa-truck-fast"></i>
          На дорогу
        </button>
      );
    }

    if (order.orderstatus === "На дороге") {
      return (
        <button
          className="orderstart-main-button"
          onClick={() => changeStatus("Приехал")}
          disabled={updating}
        >
          <i className="fa-solid fa-location-dot"></i>
          Приехал
        </button>
      );
    }

    if (order.orderstatus === "Приехал") {
      return (
        <div className="orderstart-waiting">
          <i className="fa-solid fa-clock"></i>
          Ожидайте подтверждения покупателя
        </div>
      );
    }

    if (order.orderstatus === "Получено" || order.orderstatus === "Завершен") {
      return (
        <div className="orderstart-finished">
          <i className="fa-solid fa-circle-check"></i>
          Заказ завершён
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="orderstart-page">
        <div className="orderstart-container">Загрузка заказа...</div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="orderstart-page">
      <div className="orderstart-container">
        <div className="orderstart-header">
          <button
            className="orderstart-back"
            onClick={() => navigate("/deliveryorders")}
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>

          <div>
            <h2>Доставка заказа</h2>
            <p>Заказ №{order.id}</p>
          </div>
        </div>

        {/* Фото товара */}
        <div className="orderstart-photo">
          {order.avatar ? (
            <img src={order.avatar} alt={order.name} />
          ) : (
            <div className="orderstart-no-photo">
              <i className="fa-solid fa-box"></i>
            </div>
          )}

          <div className="orderstart-photo-label">
            <i className="fa-solid fa-truck"></i>
            Доставка MarketGo
          </div>
        </div>

        {/* Информация о товаре */}
        <div className="orderstart-card">
          <div className="orderstart-section-title">
            <h3>Информация о товаре</h3>
            <span>№ {order.id}</span>
          </div>

          <h2 className="orderstart-product-name">{order.name || "Товар"}</h2>

          <div className="orderstart-info-row">
            <span>Размер</span>
            <strong>{order.size || "Не указан"}</strong>
          </div>

          <div className="orderstart-info-row">
            <span>Цвет</span>
            <strong>{order.color || "Не указан"}</strong>
          </div>

          <div className="orderstart-info-row">
            <span>Количество</span>
            <strong>{order.quantity || 1} шт.</strong>
          </div>

          <div className="orderstart-info-row">
            <span>Стоимость</span>
            <strong>
              {Number(order.price || 0).toLocaleString("ru-RU")} сом
            </strong>
          </div>
        </div>

        {/* Информация о покупателе */}
        <div className="orderstart-card">
          <h3>Информация о покупателе</h3>

          <div className="orderstart-contact">
            <i className="fa-solid fa-user"></i>
            <div>
              <span>Имя покупателя</span>
              <strong>
                {order.firstname || ""} {order.lastname || ""}
              </strong>
            </div>
          </div>

          <div className="orderstart-contact">
            <i className="fa-solid fa-phone"></i>
            <div>
              <span>Номер телефона</span>
              <strong>{order.numberphone || "Не указан"}</strong>
            </div>
          </div>

          <div className="orderstart-contact">
            <i className="fa-solid fa-location-dot"></i>
            <div>
              <span>Адрес доставки</span>
              <strong>{order.adres || "Не указан"}</strong>
            </div>
          </div>

          <div className="orderstart-contact">
            <i className="fa-solid fa-store"></i>
            <div>
              <span>Адрес магазина</span>
              <strong>{order.adrescompany || "Не указан"}</strong>
            </div>
          </div>
        </div>

        {/* Статус */}
        <div className="orderstart-card">
          <h3>Статус доставки</h3>

          <div className="orderstart-current-status">{order.orderstatus}</div>

          {getButton()}
        </div>
      </div>
    </div>
  );
}

export default Orderstart;

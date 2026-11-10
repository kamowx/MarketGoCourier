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

  const getProducts = (currentOrder) => {
    if (Array.isArray(currentOrder.products)) return currentOrder.products;

    if (currentOrder.name) {
      return [
        {
          id: currentOrder.productId,
          name: currentOrder.name,
          avatar: currentOrder.avatar,
          price: currentOrder.price,
          size: currentOrder.size,
          color: currentOrder.color,
          quantity: currentOrder.quantity || 1,
          weight: currentOrder.weight || 0,
        },
      ];
    }

    return [];
  };

  const getWeight = (currentOrder) =>
    getProducts(currentOrder).reduce(
      (sum, item) =>
        sum + Number(item.weight || 0) * Number(item.quantity || 1),
      0,
    );

  const getOrder = async () => {
    try {
      const uid = String(localStorage.getItem("uid") || "").replaceAll('"', "");

      if (!uid) {
        navigate("/deliverysignin");
        return;
      }

      const usersResponse = await axios.get(USERS_URL);

      const courier = usersResponse.data.find(
        (item) =>
          String(item.uid).replaceAll('"', "") === uid &&
          item.role === "courier",
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

  const changeStatus = async (newStatus) => {
    try {
      setUpdating(true);

      const response = await axios.get(`${ORDERS_URL}/${id}`);
      const freshOrder = response.data;

      const uid = String(localStorage.getItem("uid") || "").replaceAll('"', "");
      const usersResponse = await axios.get(USERS_URL);

      const courier = usersResponse.data.find(
        (item) =>
          String(item.uid).replaceAll('"', "") === uid &&
          item.role === "courier",
      );

      if (!courier || String(freshOrder.deliveryId) !== String(courier.id)) {
        alert("Этот заказ не принадлежит вам");
        navigate("/deliveryorders");
        return;
      }

      if (freshOrder.deliveryPaid) {
        alert("Этот заказ уже оплачен");
        setOrder(freshOrder);
        return;
      }

      const updatedStores = Array.isArray(freshOrder.storeOrders)
        ? freshOrder.storeOrders.map((store) => ({
            ...store,
            orderstatus: newStatus,
          }))
        : freshOrder.storeOrders;

      const updatedOrder = {
        ...freshOrder,
        orderstatus: newStatus,
        storeOrders: updatedStores,
      };

      await axios.put(`${ORDERS_URL}/${id}`, updatedOrder);
      setOrder(updatedOrder);

      alert("Статус заказа изменён!");
    } catch (error) {
      console.log("Ошибка изменения статуса:", error);
      alert("Не удалось изменить статус");
    } finally {
      setUpdating(false);
    }
  };

  const getButton = () => {
    if (order.orderstatus === "Едет") {
      return (
        <button
          className="orderstart-main-button"
          onClick={() => changeStatus("Получить")}
          disabled={updating}
        >
          <i className="fa-solid fa-box"></i>
          {updating ? "Обновление..." : "Получить товар у продавца"}
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
          {updating ? "Обновление..." : "На дорогу"}
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
          {updating ? "Обновление..." : "Приехал"}
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

  const products = getProducts(order);
  const totalWeight = getWeight(order);
  const deliveryPrice = totalWeight * 100;

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

        <div className="orderstart-photo">
          {products[0]?.avatar ? (
            <img src={products[0].avatar} alt={products[0].name} />
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

        <div className="orderstart-card">
          <div className="orderstart-section-title">
            <h3>Товары в заказе</h3>
            <span>№ {order.id}</span>
          </div>

          {products.map((item, index) => (
            <div key={item.id || index}>
              <h2 className="orderstart-product-name">
                {item.name || "Товар"}
              </h2>

              <div className="orderstart-info-row">
                <span>Размер</span>
                <strong>{item.size || "Не указан"}</strong>
              </div>

              <div className="orderstart-info-row">
                <span>Цвет</span>
                <strong>{item.color || "Не указан"}</strong>
              </div>

              <div className="orderstart-info-row">
                <span>Количество</span>
                <strong>{item.quantity || 1} шт.</strong>
              </div>

              <div className="orderstart-info-row">
                <span>Вес товара</span>
                <strong>
                  {Number(item.weight || 0) * Number(item.quantity || 1)} кг
                </strong>
              </div>

              <div className="orderstart-info-row">
                <span>Цена товара</span>
                <strong>
                  {(
                    Number(item.price || 0) * Number(item.quantity || 1)
                  ).toLocaleString("ru-RU")}{" "}
                  сом
                </strong>
              </div>
            </div>
          ))}

          <div className="orderstart-info-row">
            <span>Общий вес заказа</span>
            <strong>{totalWeight} кг</strong>
          </div>

          <div className="orderstart-info-row">
            <span>Оплата доставки (100 сом/кг)</span>
            <strong>{deliveryPrice.toLocaleString("ru-RU")} сом</strong>
          </div>
        </div>

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

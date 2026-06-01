from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from app.models.product import Product  # noqa: E402, F401
from app.models.customer import Customer  # noqa: E402, F401
from app.models.order import Order, OrderItem  # noqa: E402, F401

__all__ = ["Base", "Product", "Customer", "Order", "OrderItem"]

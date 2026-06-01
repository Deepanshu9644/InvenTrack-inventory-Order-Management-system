from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate


async def get_orders(db: AsyncSession) -> list[Order]:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc())
    )
    return list(result.scalars().all())


async def get_order(db: AsyncSession, order_id: int) -> Order | None:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    return result.scalar_one_or_none()


async def create_order(db: AsyncSession, order_data: OrderCreate) -> Order:
    # Verify customer exists
    customer_result = await db.execute(
        select(Customer).where(Customer.id == order_data.customer_id)
    )
    customer = customer_result.scalar_one_or_none()
    if customer is None:
        raise HTTPException(
            status_code=400,
            detail=f"Customer with id {order_data.customer_id} not found",
        )

    total_amount = Decimal("0.00")
    order_items: list[OrderItem] = []

    for item in order_data.items:
        # Fetch product with FOR UPDATE lock to prevent race conditions
        product_result = await db.execute(
            select(Product)
            .where(Product.id == item.product_id)
            .with_for_update()
        )
        product = product_result.scalar_one_or_none()

        if product is None:
            await db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Product with id {item.product_id} not found",
            )

        if product.quantity_in_stock < item.quantity:
            await db.rollback()
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Insufficient stock for product {product.name}. "
                    f"Available: {product.quantity_in_stock}, Requested: {item.quantity}"
                ),
            )

        # Decrement stock
        product.quantity_in_stock -= item.quantity

        # Create order item with price snapshot
        order_item = OrderItem(
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=product.price,
        )
        order_items.append(order_item)

        # Accumulate total
        total_amount += Decimal(str(product.price)) * item.quantity

    # Create the order
    order = Order(
        customer_id=order_data.customer_id,
        total_amount=total_amount,
        items=order_items,
    )
    db.add(order)
    await db.commit()

    # Refresh and eagerly load items
    await db.refresh(order)
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order.id)
    )
    return result.scalar_one()


async def delete_order(db: AsyncSession, order_id: int) -> bool:
    order = await get_order(db, order_id)
    if order is None:
        return False
    await db.delete(order)
    await db.commit()
    return True

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate


async def get_customers(db: AsyncSession) -> list[Customer]:
    result = await db.execute(select(Customer))
    return list(result.scalars().all())


async def get_customer(db: AsyncSession, customer_id: int) -> Customer | None:
    result = await db.execute(select(Customer).where(Customer.id == customer_id))
    return result.scalar_one_or_none()


async def create_customer(db: AsyncSession, customer_data: CustomerCreate) -> Customer:
    customer = Customer(**customer_data.model_dump())
    db.add(customer)
    try:
        await db.commit()
        await db.refresh(customer)
        return customer
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Customer with email '{customer_data.email}' already exists",
        )


async def delete_customer(db: AsyncSession, customer_id: int) -> bool:
    customer = await get_customer(db, customer_id)
    if customer is None:
        return False
    await db.delete(customer)
    await db.commit()
    return True

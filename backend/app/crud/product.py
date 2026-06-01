from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


async def get_products(db: AsyncSession) -> list[Product]:
    result = await db.execute(select(Product))
    return list(result.scalars().all())


async def get_product(db: AsyncSession, product_id: int) -> Product | None:
    result = await db.execute(select(Product).where(Product.id == product_id))
    return result.scalar_one_or_none()


async def create_product(db: AsyncSession, product_data: ProductCreate) -> Product:
    product = Product(**product_data.model_dump())
    db.add(product)
    try:
        await db.commit()
        await db.refresh(product)
        return product
    except IntegrityError:
        await db.rollback()
        raise ValueError(f"Product with SKU '{product_data.sku}' already exists")


async def update_product(
    db: AsyncSession, product_id: int, product_data: ProductUpdate
) -> Product | None:
    product = await get_product(db, product_id)
    if product is None:
        return None

    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    try:
        await db.commit()
        await db.refresh(product)
        return product
    except IntegrityError:
        await db.rollback()
        raise ValueError(f"Product with SKU '{product_data.sku}' already exists")


async def delete_product(db: AsyncSession, product_id: int) -> bool:
    product = await get_product(db, product_id)
    if product is None:
        return False
    await db.delete(product)
    await db.commit()
    return True


async def get_low_stock_products(
    db: AsyncSession, threshold: int = 5
) -> list[Product]:
    result = await db.execute(
        select(Product).where(Product.quantity_in_stock <= threshold)
    )
    return list(result.scalars().all())

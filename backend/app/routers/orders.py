from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import order as order_crud
from app.database import get_db
from app.schemas.order import OrderCreate, OrderResponse

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("", response_model=list[OrderResponse])
async def list_orders(db: AsyncSession = Depends(get_db)):
    return await order_crud.get_orders(db)


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    order_data: OrderCreate, db: AsyncSession = Depends(get_db)
):
    return await order_crud.create_order(db, order_data)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    order = await order_crud.get_order(db, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=204)
async def delete_order(order_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await order_crud.delete_order(db, order_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Order not found")
    return None

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import customer as customer_crud
from app.database import get_db
from app.schemas.customer import CustomerCreate, CustomerResponse

router = APIRouter(prefix="/api/customers", tags=["Customers"])


@router.get("", response_model=list[CustomerResponse])
async def list_customers(db: AsyncSession = Depends(get_db)):
    return await customer_crud.get_customers(db)


@router.post("", response_model=CustomerResponse, status_code=201)
async def create_customer(
    customer_data: CustomerCreate, db: AsyncSession = Depends(get_db)
):
    return await customer_crud.create_customer(db, customer_data)


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: int, db: AsyncSession = Depends(get_db)):
    customer = await customer_crud.get_customer(db, customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.delete("/{customer_id}", status_code=204)
async def delete_customer(customer_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await customer_crud.delete_customer(db, customer_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Customer not found")
    return None

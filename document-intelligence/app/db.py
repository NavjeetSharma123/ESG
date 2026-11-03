from contextlib import asynccontextmanager

from psycopg_pool import AsyncConnectionPool

from .config import settings

_pool: AsyncConnectionPool | None = None


async def open_pool() -> AsyncConnectionPool:
    global _pool
    _pool = AsyncConnectionPool(settings.database_url, open=False, min_size=1, max_size=10)
    await _pool.open()
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


def get_pool() -> AsyncConnectionPool:
    if _pool is None:
        raise RuntimeError("Database pool is not initialized")
    return _pool


@asynccontextmanager
async def tenant_transaction(pool: AsyncConnectionPool, organization_id):
    async with pool.connection() as connection:
        async with connection.transaction():
            await connection.execute("SELECT set_config('app.organization_id', %s, true)", (str(organization_id),))
            yield connection

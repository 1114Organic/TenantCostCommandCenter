from fastapi import Header, HTTPException

ROLE_ORDER = {
    "tenant_viewer": 1,
    "tenant_owner": 2,
    "product_line_leader": 3,
    "executive_viewer": 3,
    "finops_admin": 4,
}


class Principal:
    def __init__(
        self,
        role: str,
        tenant_ids: list[str] | None = None,
        product_lines: list[str] | None = None,
    ) -> None:
        self.role = role
        self.tenant_ids = tenant_ids or []
        self.product_lines = product_lines or []

    def can_view_tenant(self, tenant_id: str, product_line: str | None = None) -> bool:
        if self.role in {"finops_admin", "executive_viewer"}:
            return True
        if tenant_id in self.tenant_ids:
            return True
        return bool(product_line and self.role == "product_line_leader" and product_line in self.product_lines)

    def require_admin(self) -> None:
        if self.role != "finops_admin":
            raise HTTPException(status_code=403, detail="FinOps admin role required")


def get_principal(
    x_user_role: str = Header(default="finops_admin"),
    x_tenant_ids: str = Header(default=""),
    x_product_lines: str = Header(default=""),
) -> Principal:
    if x_user_role not in ROLE_ORDER:
        raise HTTPException(status_code=401, detail="Unknown role")
    tenants = [item.strip() for item in x_tenant_ids.split(",") if item.strip()]
    product_lines = [item.strip() for item in x_product_lines.split(",") if item.strip()]
    return Principal(x_user_role, tenants, product_lines)

"""add_user_roles

Revision ID: 0b3b13633563
Revises: 35b02fa5a346
Create Date: 2023-11-15 12:34:56.789123

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0b3b13633563'
down_revision = '35b02fa5a346'
branch_labels = None
depends_on = None

def upgrade():
    # Use batch mode for SQLite compatibility
    with op.batch_alter_table('users') as batch_op:
        # Add 'role' column, non-nullable with default 'user'
        batch_op.add_column(sa.Column('role', sa.String(), nullable=False, server_default='user'))
        # Ensure username is unique (if not already enforced)
        batch_op.create_unique_constraint('uq_users_username', ['username'])

def downgrade():
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_constraint('uq_users_username', type_='unique')
        batch_op.drop_column('role')
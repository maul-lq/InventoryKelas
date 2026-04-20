
#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Env, String, Symbol, Vec,
};

const INVENTRA_STATE: Symbol = symbol_short!("INVSTATE");

#[contracterror]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum ContractError {
    NotFound = 1,
    InvalidInput = 2,
    AlreadyExists = 3,
    InvalidStateTransition = 4,
    NotAvailable = 5,
    InsufficientStock = 6,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ItemCondition {
    Baik,
    ButuhPerbaikan,
    Rusak,
    Hilang,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ItemStatus {
    Tersedia,
    Dipinjam,
    Rusak,
    Habis,
    TidakTersedia,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum BorrowStatus {
    Menunggu,
    Disetujui,
    Ditolak,
    Selesai,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DamageStatus {
    Baru,
    Ditinjau,
    Diproses,
    Selesai,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Category {
    pub id: u64,
    pub name: String,
    pub description: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Location {
    pub id: u64,
    pub name: String,
    pub description: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Item {
    pub id: u64,
    pub item_code: String,
    pub name: String,
    pub category_id: u64,
    pub location_id: u64,
    pub total_quantity: u32,
    pub available_quantity: u32,
    pub unit: String,
    pub condition: ItemCondition,
    pub status: ItemStatus,
    pub description: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BorrowRequest {
    pub id: u64,
    pub item_id: u64,
    pub user_id: String,
    pub quantity: u32,
    pub purpose: String,
    pub borrow_date: String,
    pub expected_return_date: String,
    pub status: BorrowStatus,
    pub user_note: String,
    pub admin_note: String,
    pub approved_by: String,
    pub approved_at: u64,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DamageReport {
    pub id: u64,
    pub item_id: u64,
    pub user_id: String,
    pub issue_type: String,
    pub description: String,
    pub status: DamageStatus,
    pub follow_up_note: String,
    pub handled_by: String,
    pub handled_at: u64,
    pub created_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct InventraState {
    pub next_category_id: u64,
    pub next_location_id: u64,
    pub next_item_id: u64,
    pub next_borrow_id: u64,
    pub next_damage_id: u64,
    pub categories: Vec<Category>,
    pub locations: Vec<Location>,
    pub items: Vec<Item>,
    pub borrow_requests: Vec<BorrowRequest>,
    pub damage_reports: Vec<DamageReport>,
}

#[contract]
pub struct NotesContract;

#[contractimpl]
impl NotesContract {
    pub fn init(env: Env) {
        let state = default_state(&env);
        save_state(&env, &state);
    }

    pub fn get_categories(env: Env) -> Vec<Category> {
        load_state(&env).categories
    }

    pub fn create_category(
        env: Env,
        name: String,
        description: String,
    ) -> Result<u64, ContractError> {
        if name.len() == 0 {
            return Err(ContractError::InvalidInput);
        }

        let mut state = load_state(&env);
        ensure_category_name_unique(&state, &name)?;

        let id = state.next_category_id;
        state.next_category_id += 1;

        state.categories.push_back(Category {
            id,
            name,
            description,
        });

        save_state(&env, &state);
        Ok(id)
    }

    pub fn update_category(
        env: Env,
        category_id: u64,
        name: String,
        description: String,
    ) -> Result<(), ContractError> {
        if name.len() == 0 {
            return Err(ContractError::InvalidInput);
        }

        let mut state = load_state(&env);
        let index = find_category_index(&state, category_id).ok_or(ContractError::NotFound)?;
        ensure_category_name_unique_except(&state, &name, category_id)?;

        state.categories.set(
            index,
            Category {
                id: category_id,
                name,
                description,
            },
        );

        save_state(&env, &state);
        Ok(())
    }

    pub fn delete_category(env: Env, category_id: u64) -> Result<(), ContractError> {
        let mut state = load_state(&env);
        let index = find_category_index(&state, category_id).ok_or(ContractError::NotFound)?;

        for i in 0..state.items.len() {
            let item = state.items.get(i).ok_or(ContractError::NotFound)?;
            if item.category_id == category_id {
                return Err(ContractError::InvalidStateTransition);
            }
        }

        state.categories.remove(index);
        save_state(&env, &state);
        Ok(())
    }

    pub fn get_locations(env: Env) -> Vec<Location> {
        load_state(&env).locations
    }

    pub fn create_location(
        env: Env,
        name: String,
        description: String,
    ) -> Result<u64, ContractError> {
        if name.len() == 0 {
            return Err(ContractError::InvalidInput);
        }

        let mut state = load_state(&env);
        ensure_location_name_unique(&state, &name)?;

        let id = state.next_location_id;
        state.next_location_id += 1;

        state.locations.push_back(Location {
            id,
            name,
            description,
        });

        save_state(&env, &state);
        Ok(id)
    }

    pub fn update_location(
        env: Env,
        location_id: u64,
        name: String,
        description: String,
    ) -> Result<(), ContractError> {
        if name.len() == 0 {
            return Err(ContractError::InvalidInput);
        }

        let mut state = load_state(&env);
        let index = find_location_index(&state, location_id).ok_or(ContractError::NotFound)?;
        ensure_location_name_unique_except(&state, &name, location_id)?;

        state.locations.set(
            index,
            Location {
                id: location_id,
                name,
                description,
            },
        );

        save_state(&env, &state);
        Ok(())
    }

    pub fn delete_location(env: Env, location_id: u64) -> Result<(), ContractError> {
        let mut state = load_state(&env);
        let index = find_location_index(&state, location_id).ok_or(ContractError::NotFound)?;

        for i in 0..state.items.len() {
            let item = state.items.get(i).ok_or(ContractError::NotFound)?;
            if item.location_id == location_id {
                return Err(ContractError::InvalidStateTransition);
            }
        }

        state.locations.remove(index);
        save_state(&env, &state);
        Ok(())
    }

    pub fn get_items(env: Env) -> Vec<Item> {
        load_state(&env).items
    }

    pub fn create_item(
        env: Env,
        item_code: String,
        name: String,
        category_id: u64,
        location_id: u64,
        total_quantity: u32,
        available_quantity: u32,
        unit: String,
        condition: ItemCondition,
        requested_status: ItemStatus,
        description: String,
    ) -> Result<u64, ContractError> {
        if item_code.len() == 0 || name.len() == 0 || unit.len() == 0 {
            return Err(ContractError::InvalidInput);
        }
        if available_quantity > total_quantity {
            return Err(ContractError::InvalidInput);
        }

        let mut state = load_state(&env);
        ensure_item_code_unique(&state, &item_code)?;
        find_category_index(&state, category_id).ok_or(ContractError::NotFound)?;
        find_location_index(&state, location_id).ok_or(ContractError::NotFound)?;

        let id = state.next_item_id;
        state.next_item_id += 1;

        let status = normalize_item_status(&condition, available_quantity, requested_status);

        state.items.push_back(Item {
            id,
            item_code,
            name,
            category_id,
            location_id,
            total_quantity,
            available_quantity,
            unit,
            condition,
            status,
            description,
        });

        save_state(&env, &state);
        Ok(id)
    }

    pub fn update_item(
        env: Env,
        item_id: u64,
        item_code: String,
        name: String,
        category_id: u64,
        location_id: u64,
        total_quantity: u32,
        available_quantity: u32,
        unit: String,
        condition: ItemCondition,
        requested_status: ItemStatus,
        description: String,
    ) -> Result<(), ContractError> {
        if item_code.len() == 0 || name.len() == 0 || unit.len() == 0 {
            return Err(ContractError::InvalidInput);
        }
        if available_quantity > total_quantity {
            return Err(ContractError::InvalidInput);
        }

        let mut state = load_state(&env);
        let index = find_item_index(&state, item_id).ok_or(ContractError::NotFound)?;
        ensure_item_code_unique_except(&state, &item_code, item_id)?;
        find_category_index(&state, category_id).ok_or(ContractError::NotFound)?;
        find_location_index(&state, location_id).ok_or(ContractError::NotFound)?;

        let status = normalize_item_status(&condition, available_quantity, requested_status);

        state.items.set(
            index,
            Item {
                id: item_id,
                item_code,
                name,
                category_id,
                location_id,
                total_quantity,
                available_quantity,
                unit,
                condition,
                status,
                description,
            },
        );

        save_state(&env, &state);
        Ok(())
    }

    pub fn delete_item(env: Env, item_id: u64) -> Result<(), ContractError> {
        let mut state = load_state(&env);
        let item_index = find_item_index(&state, item_id).ok_or(ContractError::NotFound)?;

        for i in 0..state.borrow_requests.len() {
            let borrow = state
                .borrow_requests
                .get(i)
                .ok_or(ContractError::NotFound)?;
            if borrow.item_id == item_id
                && (borrow.status == BorrowStatus::Menunggu || borrow.status == BorrowStatus::Disetujui)
            {
                return Err(ContractError::InvalidStateTransition);
            }
        }

        state.items.remove(item_index);
        save_state(&env, &state);
        Ok(())
    }

    pub fn get_borrow_requests(env: Env) -> Vec<BorrowRequest> {
        load_state(&env).borrow_requests
    }

    pub fn create_borrow_request(
        env: Env,
        item_id: u64,
        user_id: String,
        quantity: u32,
        purpose: String,
        borrow_date: String,
        expected_return_date: String,
        user_note: String,
    ) -> Result<u64, ContractError> {
        if user_id.len() == 0
            || purpose.len() == 0
            || borrow_date.len() == 0
            || expected_return_date.len() == 0
            || quantity == 0
        {
            return Err(ContractError::InvalidInput);
        }

        let mut state = load_state(&env);
        let item_index = find_item_index(&state, item_id).ok_or(ContractError::NotFound)?;
        let item = state.items.get(item_index).ok_or(ContractError::NotFound)?;

        if item.status != ItemStatus::Tersedia {
            return Err(ContractError::NotAvailable);
        }
        if item.available_quantity < quantity {
            return Err(ContractError::InsufficientStock);
        }

        let id = state.next_borrow_id;
        state.next_borrow_id += 1;

        state.borrow_requests.push_back(BorrowRequest {
            id,
            item_id,
            user_id,
            quantity,
            purpose,
            borrow_date,
            expected_return_date,
            status: BorrowStatus::Menunggu,
            user_note,
            admin_note: String::from_str(&env, ""),
            approved_by: String::from_str(&env, ""),
            approved_at: 0,
            created_at: env.ledger().timestamp(),
        });

        save_state(&env, &state);
        Ok(id)
    }

    pub fn update_borrow_status(
        env: Env,
        borrow_id: u64,
        status: BorrowStatus,
        admin_note: String,
        approved_by: String,
    ) -> Result<(), ContractError> {
        if approved_by.len() == 0 {
            return Err(ContractError::InvalidInput);
        }

        let mut state = load_state(&env);
        let borrow_index = find_borrow_index(&state, borrow_id).ok_or(ContractError::NotFound)?;
        let mut borrow = state
            .borrow_requests
            .get(borrow_index)
            .ok_or(ContractError::NotFound)?;
        let item_index = find_item_index(&state, borrow.item_id).ok_or(ContractError::NotFound)?;
        let mut item = state.items.get(item_index).ok_or(ContractError::NotFound)?;

        let previous_status = borrow.status.clone();

        if previous_status == BorrowStatus::Selesai && status != BorrowStatus::Selesai {
            return Err(ContractError::InvalidStateTransition);
        }
        if status == BorrowStatus::Selesai && previous_status != BorrowStatus::Disetujui {
            return Err(ContractError::InvalidStateTransition);
        }

        if status == BorrowStatus::Disetujui && previous_status != BorrowStatus::Disetujui {
            if item.available_quantity < borrow.quantity {
                return Err(ContractError::InsufficientStock);
            }
            item.available_quantity -= borrow.quantity;
            item.status = normalize_item_status(&item.condition, item.available_quantity, ItemStatus::Dipinjam);
            borrow.approved_at = env.ledger().timestamp();
            borrow.approved_by = approved_by.clone();
        }

        if previous_status == BorrowStatus::Disetujui && status == BorrowStatus::Ditolak {
            item.available_quantity += borrow.quantity;
            if item.available_quantity > item.total_quantity {
                item.available_quantity = item.total_quantity;
            }
            item.status = normalize_item_status(&item.condition, item.available_quantity, ItemStatus::Tersedia);
        }

        if status == BorrowStatus::Selesai {
            item.available_quantity += borrow.quantity;
            if item.available_quantity > item.total_quantity {
                item.available_quantity = item.total_quantity;
            }
            item.status = normalize_item_status(&item.condition, item.available_quantity, ItemStatus::Tersedia);
        }

        borrow.status = status;
        borrow.admin_note = admin_note;
        if borrow.approved_by.len() == 0 {
            borrow.approved_by = approved_by;
        }

        state.items.set(item_index, item);
        state.borrow_requests.set(borrow_index, borrow);
        save_state(&env, &state);
        Ok(())
    }

    pub fn get_damage_reports(env: Env) -> Vec<DamageReport> {
        load_state(&env).damage_reports
    }

    pub fn create_damage_report(
        env: Env,
        item_id: u64,
        user_id: String,
        issue_type: String,
        description: String,
    ) -> Result<u64, ContractError> {
        if user_id.len() == 0 || issue_type.len() == 0 || description.len() == 0 {
            return Err(ContractError::InvalidInput);
        }

        let mut state = load_state(&env);
        find_item_index(&state, item_id).ok_or(ContractError::NotFound)?;

        let id = state.next_damage_id;
        state.next_damage_id += 1;

        state.damage_reports.push_back(DamageReport {
            id,
            item_id,
            user_id,
            issue_type,
            description,
            status: DamageStatus::Baru,
            follow_up_note: String::from_str(&env, ""),
            handled_by: String::from_str(&env, ""),
            handled_at: 0,
            created_at: env.ledger().timestamp(),
        });

        save_state(&env, &state);
        Ok(id)
    }

    pub fn update_damage_status(
        env: Env,
        damage_id: u64,
        status: DamageStatus,
        follow_up_note: String,
        handled_by: String,
        item_condition: ItemCondition,
        requested_item_status: ItemStatus,
    ) -> Result<(), ContractError> {
        if handled_by.len() == 0 {
            return Err(ContractError::InvalidInput);
        }

        let mut state = load_state(&env);
        let damage_index = find_damage_index(&state, damage_id).ok_or(ContractError::NotFound)?;
        let mut damage = state
            .damage_reports
            .get(damage_index)
            .ok_or(ContractError::NotFound)?;
        let item_index = find_item_index(&state, damage.item_id).ok_or(ContractError::NotFound)?;
        let mut item = state.items.get(item_index).ok_or(ContractError::NotFound)?;

        damage.status = status;
        damage.follow_up_note = follow_up_note;
        damage.handled_by = handled_by;
        damage.handled_at = env.ledger().timestamp();

        item.condition = item_condition;
        item.status = normalize_item_status(&item.condition, item.available_quantity, requested_item_status);

        state.damage_reports.set(damage_index, damage);
        state.items.set(item_index, item);
        save_state(&env, &state);
        Ok(())
    }
}

fn default_state(env: &Env) -> InventraState {
    InventraState {
        next_category_id: 1,
        next_location_id: 1,
        next_item_id: 1,
        next_borrow_id: 1,
        next_damage_id: 1,
        categories: Vec::new(env),
        locations: Vec::new(env),
        items: Vec::new(env),
        borrow_requests: Vec::new(env),
        damage_reports: Vec::new(env),
    }
}

fn load_state(env: &Env) -> InventraState {
    env.storage()
        .instance()
        .get(&INVENTRA_STATE)
        .unwrap_or(default_state(env))
}

fn save_state(env: &Env, state: &InventraState) {
    env.storage().instance().set(&INVENTRA_STATE, state);
}

fn normalize_item_status(
    condition: &ItemCondition,
    available_quantity: u32,
    requested_status: ItemStatus,
) -> ItemStatus {
    if *condition == ItemCondition::Rusak || *condition == ItemCondition::Hilang {
        return ItemStatus::Rusak;
    }
    if available_quantity == 0 {
        return ItemStatus::Habis;
    }
    if requested_status == ItemStatus::TidakTersedia {
        return ItemStatus::TidakTersedia;
    }
    ItemStatus::Tersedia
}

fn find_category_index(state: &InventraState, id: u64) -> Option<u32> {
    for i in 0..state.categories.len() {
        let category = state.categories.get(i)?;
        if category.id == id {
            return Some(i);
        }
    }
    None
}

fn find_location_index(state: &InventraState, id: u64) -> Option<u32> {
    for i in 0..state.locations.len() {
        let location = state.locations.get(i)?;
        if location.id == id {
            return Some(i);
        }
    }
    None
}

fn find_item_index(state: &InventraState, id: u64) -> Option<u32> {
    for i in 0..state.items.len() {
        let item = state.items.get(i)?;
        if item.id == id {
            return Some(i);
        }
    }
    None
}

fn find_borrow_index(state: &InventraState, id: u64) -> Option<u32> {
    for i in 0..state.borrow_requests.len() {
        let borrow = state.borrow_requests.get(i)?;
        if borrow.id == id {
            return Some(i);
        }
    }
    None
}

fn find_damage_index(state: &InventraState, id: u64) -> Option<u32> {
    for i in 0..state.damage_reports.len() {
        let damage = state.damage_reports.get(i)?;
        if damage.id == id {
            return Some(i);
        }
    }
    None
}

fn ensure_category_name_unique(state: &InventraState, name: &String) -> Result<(), ContractError> {
    for i in 0..state.categories.len() {
        let category = state.categories.get(i).ok_or(ContractError::NotFound)?;
        if category.name == *name {
            return Err(ContractError::AlreadyExists);
        }
    }
    Ok(())
}

fn ensure_category_name_unique_except(
    state: &InventraState,
    name: &String,
    except_id: u64,
) -> Result<(), ContractError> {
    for i in 0..state.categories.len() {
        let category = state.categories.get(i).ok_or(ContractError::NotFound)?;
        if category.name == *name && category.id != except_id {
            return Err(ContractError::AlreadyExists);
        }
    }
    Ok(())
}

fn ensure_location_name_unique(state: &InventraState, name: &String) -> Result<(), ContractError> {
    for i in 0..state.locations.len() {
        let location = state.locations.get(i).ok_or(ContractError::NotFound)?;
        if location.name == *name {
            return Err(ContractError::AlreadyExists);
        }
    }
    Ok(())
}

fn ensure_location_name_unique_except(
    state: &InventraState,
    name: &String,
    except_id: u64,
) -> Result<(), ContractError> {
    for i in 0..state.locations.len() {
        let location = state.locations.get(i).ok_or(ContractError::NotFound)?;
        if location.name == *name && location.id != except_id {
            return Err(ContractError::AlreadyExists);
        }
    }
    Ok(())
}

fn ensure_item_code_unique(state: &InventraState, item_code: &String) -> Result<(), ContractError> {
    for i in 0..state.items.len() {
        let item = state.items.get(i).ok_or(ContractError::NotFound)?;
        if item.item_code == *item_code {
            return Err(ContractError::AlreadyExists);
        }
    }
    Ok(())
}

fn ensure_item_code_unique_except(
    state: &InventraState,
    item_code: &String,
    except_id: u64,
) -> Result<(), ContractError> {
    for i in 0..state.items.len() {
        let item = state.items.get(i).ok_or(ContractError::NotFound)?;
        if item.item_code == *item_code && item.id != except_id {
            return Err(ContractError::AlreadyExists);
        }
    }
    Ok(())
}

mod test;
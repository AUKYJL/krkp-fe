# UI Contract: Taxi Parks Routes & Sidebar Shell

**Created**: 2026-05-29  
**Spec**: `specs/001-taxiparks-sidebar/spec.md`  
**Pencil**: Node `jRRvC`

## Purpose

Document the navigation shell contract so implementation stays consistent: each sidebar item maps to a dedicated route, and the sidebar persists on the left.

## Contract

- All destination pages for sidebar navigation share a single “Taxi Parks layout shell” (persistent left sidebar).
- Sidebar items (labels/order/icons if present) are sourced strictly from Pencil Node `jRRvC`.

## Routes

The exact list of routes and labels is extracted from Pencil during implementation. Implemented list:

| id | label (RU) | icon | route |
|---|---|---|---|
| home | Главная | ⌂ | `/taxiparks/home` |
| taxiparks | Таксопарки | ▦ | `/taxiparks` |
| drivers | Водители | 👤 | `/taxiparks/drivers` |
| vehicles | Автомобили | ▣ | `/taxiparks/vehicles` |
| finance | Финансы | ₽ | `/taxiparks/finance` |
| reports | Отчеты | ◫ | `/taxiparks/reports` |
| settings | Настройки | ⚙ | `/taxiparks/settings` |

## Canonical URL scheme (source of truth)

- Base page: `/taxiparks`
- Section page: `/taxiparks/:id` (where `:id` is the stable section identifier derived from Pencil)

## Usage

- All routes above render under the same `/taxiparks` layout shell with the persistent left sidebar.

# Project info

## Szenario
- user declare lists of (location, utility)
  - we cannot trust their declarations
- declares a maximum payment they are willing to provide
  - these we can trust
- location distances are known
- vehicle can be picked for the tour
  - limits the places for how many users can join - fixed number
- maximum length of tour (km)
- cost of tour is proportional to km and a fixed cost

## Goal
- system selects the users that will be part of the tour
- it defines the locations and the path
- defines the payments for the individual users

## Constraint
- no user can be charged more than their maximum declared payment

## Desiderata
- cost of the tour must be distributed in a fair way among the users in the vehicle
  - cost is proportional to the km
  - no user has an argument against the cost distribution
- fixed cost must be distributed among the users based on their declared utilities
  - the implemented mechanism should lead to truthfully declared utilities


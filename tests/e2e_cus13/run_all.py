#!/usr/bin/env python
"""
Automated Opaque-Box E2E Test Runner for CUS 13: Gestión de Caja
Restaurante Girasoles - Track A Test Suite
"""

import sys
import time
import unittest
import argparse
from typing import List, Tuple

# Import test cases
from tests.e2e_cus13.test_tier1_features import TestTier1Features
from tests.e2e_cus13.test_tier2_boundaries import TestTier2Boundaries
from tests.e2e_cus13.test_tier3_combinations import TestTier3Combinations
from tests.e2e_cus13.test_tier4_scenarios import TestTier4Scenarios

def run_suite(tiers: List[int], verbose: bool = True) -> bool:
    print("=" * 75)
    print("  GIRASOLES RESTAURANT - CUS 13: GESTIÓN DE CAJA")
    print("  AUTOMATED OPAQUE-BOX E2E TEST RUNNER")
    print("=" * 75)
    print(f"Selected Tiers: {tiers}")
    print(f"Start Time    : {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 75)

    suite = unittest.TestSuite()
    loader = unittest.TestLoader()

    tier_map = {
        1: (TestTier1Features, "Tier 1: Feature Coverage (HU34, HU35, HU36, CUS 11)"),
        2: (TestTier2Boundaries, "Tier 2: Boundary & Corner Cases (RV-119..RV-132, MSG-166..189)"),
        3: (TestTier3Combinations, "Tier 3: Cross-Feature Combinations & Full Lifecycle"),
        4: (TestTier4Scenarios, "Tier 4: Real-World Shift & Overnight Application Scenarios")
    }

    total_test_count = 0
    for t in tiers:
        if t in tier_map:
            cls, name = tier_map[t]
            tests = loader.loadTestsFromTestCase(cls)
            suite.addTests(tests)
            count = tests.countTestCases()
            total_test_count += count
            print(f"[*] Loaded {name} ({count} test cases)")

    print("-" * 75)
    print(f"Total Test Cases to Execute: {total_test_count}")
    print("=" * 75)
    print()

    start_time = time.time()
    runner = unittest.TextTestRunner(verbosity=2 if verbose else 1)
    result = runner.run(suite)
    elapsed = time.time() - start_time

    print()
    print("=" * 75)
    print("  TEST EXECUTION SUMMARY - CUS 13")
    print("=" * 75)
    print(f"Total Tests Run : {result.testsRun}")
    print(f"Passed          : {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures        : {len(result.failures)}")
    print(f"Errors          : {len(result.errors)}")
    print(f"Skipped         : {len(result.skipped)}")
    print(f"Elapsed Time    : {elapsed:.2f} seconds")
    print("-" * 75)

    if result.wasSuccessful():
        print(">>> ALL TESTS PASSED SUCCESSFULLY (100%) <<<")
        print("=" * 75)
        return True
    else:
        print(">>> SOME TESTS FAILED / DETECTED UNIMPLEMENTED ENDPOINTS <<<")
        print("=" * 75)
        return False

def main():
    parser = argparse.ArgumentParser(description="Runner for CUS 13 E2E Test Suite")
    parser.add_argument("--tier", type=int, choices=[1, 2, 3, 4], help="Run a specific tier only (1, 2, 3, or 4)")
    parser.add_argument("--quiet", action="store_true", help="Minimal output")
    args = parser.parse_args()

    selected_tiers = [args.tier] if args.tier else [1, 2, 3, 4]
    success = run_suite(selected_tiers, verbose=not args.quiet)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

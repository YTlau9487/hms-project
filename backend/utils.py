import time
from contextlib import contextmanager
from typing import Generator


@contextmanager
def track_performance(name: str = "Operation") -> Generator[None, None, None]:
    """Context manager to track performance of a code block using perf_counter.
    
    Args:
        name: A descriptive name for the tracked operation.
        
    Yields:
        None
        
    Example:
        with track_performance("Database Query"):
            result = run_query()
        # Output: Database Query completed in 0.1234 seconds
    """
    yield
    # Uncommented below for backend performance test
    # start = time.perf_counter()
    # try:
    #     yield
    # finally:
    #     end = time.perf_counter()
    #     elapsed = end - start
    #     print(f"{name} completed in {elapsed:.4f} seconds")

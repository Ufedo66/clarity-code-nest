import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test session creation",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('code-nest', 'create-session', 
        [types.ascii("Test Session"), types.uint(3600), types.uint(2)],
        deployer.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectUint(1);
    
    const response = chain.callReadOnlyFn(
      'code-nest',
      'get-session',
      [types.uint(1)],
      deployer.address
    );
    
    response.result.expectSome().expectTuple({
      'title': types.ascii("Test Session"),
      'creator': deployer.address,
      'duration': types.uint(3600),
      'max-participants': types.uint(2),
      'current-participants': types.uint(1),
      'active': true
    });
  }
});

Clarinet.test({
  name: "Test session joining",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const participant = accounts.get('wallet_1')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('code-nest', 'create-session',
        [types.ascii("Test Session"), types.uint(3600), types.uint(2)],
        deployer.address
      )
    ]);
    
    block = chain.mineBlock([
      Tx.contractCall('code-nest', 'join-session',
        [types.uint(1)],
        participant.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
    
    const response = chain.callReadOnlyFn(
      'code-nest',
      'get-session',
      [types.uint(1)],
      deployer.address
    );
    
    response.result.expectSome().expectTuple({
      'current-participants': types.uint(2)
    });
  }
});

Clarinet.test({
  name: "Test review submission and reputation update",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const reviewer = accounts.get('wallet_1')!;
    
    chain.mineBlock([
      Tx.contractCall('code-nest', 'create-session',
        [types.ascii("Test Session"), types.uint(3600), types.uint(2)],
        deployer.address
      )
    ]);
    
    let block = chain.mineBlock([
      Tx.contractCall('code-nest', 'submit-review',
        [types.uint(1), types.ascii("Great session"), types.uint(5)],
        reviewer.address
      )
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
    
    const response = chain.callReadOnlyFn(
      'code-nest',
      'get-user-reputation',
      [types.principal(deployer.address)],
      deployer.address
    );
    
    response.result.expectTuple({
      'score': types.uint(5)
    });
  }
});

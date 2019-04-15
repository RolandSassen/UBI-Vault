import "./Pausable.sol";

contract PausableDestroyable is Pausable {

    function destroy() public whenPaused {
        require(selfDestructAt <= now);
        // send remaining funds to address 0, to prevent the owner from taking the funds himself (and steal the funds from the vault)
        selfdestruct(address(0));
    }
}

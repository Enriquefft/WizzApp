{
  description = "generic Flake for Next api's.";

  inputs = {
    nixpkgs.url =
      "github:NixOS/nixpkgs/e2a6a7310f5432a733c848702ab4ea31751a10d0";
    flakelight.url = "github:nix-community/flakelight";
  };

  outputs = { flakelight, nixpkgs, ... }:
    flakelight ./. {

      nixpkgs.config.allowUnfree = true;
      inputs.nixpkgs = nixpkgs;

      devShell.packages = pkgs:
        with pkgs; [

          bun
          nodejs

          coreutils

          lefthook
          commitlint-rs
          biome
          google-chrome

        ];
      devShell.shellHook = ''

        PUPPETEER_SKIP_DOWNLOAD=1
      '';
    };

}

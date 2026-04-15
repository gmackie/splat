{
  description = "splat.gmac.io landing page";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "aarch64-darwin" "x86_64-darwin" ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;

      mkSplat = system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
          nodejs = pkgs.nodejs_22;
        in
        pkgs.buildNpmPackage {
          pname = "splat";
          version = "0.1.0";

          src = ./.;

          npmDepsHash = "sha256-iEC9+udXq2IlEEKRba7ZuXzDBAs4GwwsEpOxIRro13A=";

          nativeBuildInputs = [ nodejs pkgs.makeWrapper ];

          buildPhase = ''
            runHook preBuild
            export NODE_ENV=production
            npm run build
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall

            mkdir -p $out/app $out/bin
            cp -r dist $out/app/dist
            cp server.mjs package.json $out/app/
            cp -r node_modules $out/app/node_modules

            makeWrapper ${nodejs}/bin/node $out/bin/splat \
              --add-flags "$out/app/server.mjs" \
              --set NODE_ENV production \
              --set-default PORT 3000 \
              --set-default DATA_DIR /var/lib/splat \
              --chdir "$out/app"

            runHook postInstall
          '';

          meta = {
            description = "splat.gmac.io landing page with waitlist capture";
            mainProgram = "splat";
          };
        };
    in
    {
      packages = forAllSystems (system: {
        default = mkSplat system;
        splat = mkSplat system;
      });
    };
}

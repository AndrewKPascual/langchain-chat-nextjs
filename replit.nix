{pkgs}:
{
  deps = [
    pkgs.python39Packages.openai
    pkgs.python39Packages.poetry
    pkgs.nodejs-18_x
    pkgs.run
    pkgs.python39Packages.pip
    pkgs.python39Full
    pkgs.nodePackages.typescript-language-server
    pkgs.nodePackages.yarn
    pkgs.replitPackages.jest
  ];
}

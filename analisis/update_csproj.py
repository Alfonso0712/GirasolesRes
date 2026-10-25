with open('tests/GirasolesRes.Tests/GirasolesRes.Tests.csproj', 'r', encoding='utf-8') as f:
    text = f.read()

target = r'<ProjectReference Include="..\..\backend\GirasolesRes.Infrastructure\GirasolesRes.Infrastructure.csproj" />'
replacement = """<ProjectReference Include="..\..\backend\GirasolesRes.Infrastructure\GirasolesRes.Infrastructure.csproj" />
    <ProjectReference Include="..\..\backend\GirasolesRes.API\GirasolesRes.API.csproj" />
  </ItemGroup>
  <ItemGroup>
    <FrameworkReference Include="Microsoft.AspNetCore.App" />"""

if target in text:
    text = text.replace(target, replacement)
    with open('tests/GirasolesRes.Tests/GirasolesRes.Tests.csproj', 'w', encoding='utf-8', newline='') as f:
        f.write(text)
    print('Updated successfully')
else:
    print('Target not found')

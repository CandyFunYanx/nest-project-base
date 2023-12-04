import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decoration/roles.decoration';
import { Role } from 'src/enum/role.enum';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1.通过反射获取到装饰器的权限
    // getAllAndOverride读取路由上的metadata getAllAndMerge合并路由上的metadata
    const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2.获取req拿到鉴权后的用户数据
    const req = context.switchToHttp().getRequest();

    // 3.通过用户数据从数据查询权限
    const user = await this.usersService.findOne(req.user._id);
    const roleIds = user.roles.map((item) => item.id);

    // 4.判断用户权限是否为装饰器的权限 的some返回boolean
    const flag = requireRoles.some((role) => roleIds.includes(role));

    return flag;
  }
}

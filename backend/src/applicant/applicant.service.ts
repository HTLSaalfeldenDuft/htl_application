import { Injectable } from '@nestjs/common';
import { Applicant, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import * as crypto from 'crypto'
import { Observable, from, map, mergeMap } from 'rxjs';
import { ApiError, ApiErrorType } from 'src/common/api-error';
import { SignInDto } from 'src/auth/sign-in.dto';

@Injectable()
export class ApplicantService {
    constructor(private prisma: PrismaService) {}

    getOne(select: Prisma.ApplicantSelect, where: Prisma.ApplicantWhereUniqueInput): Promise<Applicant> {
      return this.prisma.applicant.findUnique({select, where})
    }
  
    getMany(): Promise<Applicant[]> {
      return this.prisma.applicant.findMany() 
    }
  
    create(data: Prisma.ApplicantCreateInput) {
      this.setPassword(data, (data as any).password)
      return this.prisma.applicant.create({
          data,
      })
    }
  
    update(params: {
        where: Prisma.ApplicantWhereUniqueInput;
        data: Prisma.ApplicantUpdateInput;
      }) {
        const { data, where } = params;
        return this.prisma.applicant.update({
            where,
            data,
        })        
    }
  
    delete(where: Prisma.ApplicantWhereUniqueInput): Promise<Applicant> {
        return this.prisma.applicant.delete({where})
    }

    checkCredentials(signInDto: SignInDto): Observable<string> {
      return this.getByEmail(signInDto.email).pipe(
          map((applicant: Applicant) => {
              if (applicant) {
                  if (!applicant.active) {
                      throw new ApiError(ApiErrorType.USER_NOT_ACTIVE)
                  }

                  const passHash = crypto.createHmac('sha512', process.env.HMAC_SECRET).update(signInDto.password).digest('hex')
                  if (applicant.passwordHash === passHash) {
                      delete applicant.passwordHash
                      return applicant.id
                  } else {
                      throw new ApiError(ApiErrorType.WRONG_PASSWORD)
                  }
              } else {
                  throw new ApiError(ApiErrorType.USER_NOT_FOUND)
              }
          })
      )
    }

    public confirmEmail(email: string): Observable<any> {
      return from(this.getByEmail(email)).pipe(
          mergeMap(application => {
              if(application.emailConfirmed) {
                  throw new ApiError(ApiErrorType.EMAIL_ALREADY_CONFIRMED);
              } else {
                  return this.update({
                    where: { id: application.id },
                    data: {
                      emailConfirmed: true
                    }
                  })
              }
          })
      )
    }

    getByEmail(email: string): Observable<Applicant> {
      return from(this.prisma.applicant.findUnique({
        where: { contactEmail: email }
      }))
    }
   
    private setPassword(applicant: Prisma.ApplicantCreateInput, password: string) {
      const passHash = crypto.createHmac('sha512', process.env.HMAC_SECRET).update(password).digest('hex')
      applicant.passwordHash = passHash
      delete (applicant as any).password
      delete (applicant as any).passwordConfirmation
  }    
}
